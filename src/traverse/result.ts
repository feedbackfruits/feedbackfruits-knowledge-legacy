import semtools from 'semantic-toolkit';

import * as Edges from './edges';
import * as Query from './query';

const lowerCaseFirst = (str: string): string => {
  return str[0].toLowerCase() + str.slice(1, str.length);
};

export type TraversalResult = {
  id: string
  type: string
  score: number
  paths: string[][]
  attributes: { [key: string]: any }
};

export type Path = string[];

export function parseAttributes(result: Query.QueryResult, type: string): { [key: string]: string | string[] } {
    const attributes = Edges.Attributes[type] || {};

    const localAttributes = Object.entries(attributes).reduce((memo, [ key, value ]) => {
      const localName = semtools.getLocalName(key);
      return {
        ...memo,
        [localName]: value
      }
    }, {});

    const attributeValues = Object.entries(result).reduce((memo, [ key, value ]) => {
      // console.log(`${key} in localAttributes?`, key in localAttributes);
      if (!(key in localAttributes && localAttributes[key])) return memo;
      return {
        ...memo,
        [key]: value
      };
    }, {});

    return attributeValues;
}

export function scoreResult(result: Query.QueryResult, type: string, baseScore: number): number {
    const { factor } = Edges.EdgesFactors[type];
    const score = baseScore * factor;
    return score;
}

export function appendPaths(paths: string[][], key: string): string[][] {
    return paths.map(path => [ ...path, key ]);
}

export function parseResult(result: Query.QueryResult, baseScore: number, basePaths: string[][], resultId: string): TraversalResult[] {
  // console.log(`Parsing result with baseScore ${baseScore}:`, result)
  const { id } = result;
  const types = Object.keys([].concat(result.type || []).map(type => type.id as string).reduce((memo, type) => ({ ...memo, [type]: true }), {}));
  const relevantTypes = types.filter(type => type in Edges.EdgesFactors);

  // console.log(`Found ${relevantTypes.length} relevant types:`, relevantTypes.join(', '));
  // const edge = { factor: 1 };
  // const { factor } = edge;
  const traversalResults = relevantTypes.reduce((memo, type) => {
    const attributes = parseAttributes(result, type);
    const score = scoreResult(result, type, baseScore);
    const paths = appendPaths(basePaths, resultId)

    const traversalResult = {
      id,
      type,
      attributes,
      score,
      paths
    };

    const edges = Edges.EdgesFactors[type];
    const recursed = Object.entries(edges).reduce((memo, [ key, edgeFactor ]) => {
      if (key === 'factor') return memo;

      const edgeKey = lowerCaseFirst(semtools.getLocalName(key));
      const edgeValues: Query.QueryResult[] = [].concat(result[edgeKey] || []);
      const { factor } = edgeFactor as Edges.EdgeFactor;
      const edgeScore = baseScore * factor;

      const traversalResults = edgeValues.reduce((memo, result) => {
        const traversalResults = parseResult(result, edgeScore, paths, key);
        return [
          ...memo,
          ...traversalResults
        ]
      }, []);

      return [
        ...memo,
        ...deduplicateResults(traversalResults)
      ]

    }, []);

    return [
      ...memo,
      traversalResult,
      ...deduplicateResults(recursed)
    ];
  }, []);

  return traversalResults;
}

export function parseResults(results: Query.QueryResult, byType: Query.QueryMap): TraversalResult[] {
  const parsed = Object.entries(byType).reduce((memo, [ type, queryables ]) => {
    const byId = queryables.reduce((memo, queryable) => {
      const { id } = queryable;
      return {
        ...memo,
        [id]: queryable
      }
    }, {});

    const typeName = lowerCaseFirst(semtools.getLocalName(type));
    // console.log(`Looking for ${typeName} in: `, Object.keys(results));
    const res: Query.QueryResult[] = [].concat(results[typeName]);
    const parsed = res.reduce((memo: TraversalResult[], result) => {
      const { id } = result;
      const queryable = byId[id];
      const { score: baseScore, paths: basePaths } = queryable;
      const parsedResults = parseResult(result, baseScore, basePaths, id);

      return [
        ...parsedResults,
        ...memo
      ];
    }, [] as TraversalResult[]);

    return [
      ...memo,
      ...deduplicateResults(parsed)
    ]
  }, [] as TraversalResult[]);

  // console.log('Parsed result:', parsed);

  const deduplicated = deduplicateResults(parsed);
  return deduplicated;
}

export function deduplicateResults(results: TraversalResult[]): TraversalResult[] {
  const grouped = Object.values<TraversalResult[]>(results.reduce((memo, result) => {
    // if (result.score == 0) return memo;

    const key = result.id;

    // TODO: Maybe weighted sum of scores here?
    if (key in memo) memo[key] = [ ...memo[key], result ];

    memo[key] = [ result ];

    return memo;
  }, {}));

  const averaged = grouped.map(results => {
    if (results.length == 1) return results[0];
    const [ result ] = results;
    // console.log('Results length:', results.length);
    const mergedAttributes = results.reduce((memo, result) => ({ ...memo, ...result.attributes }), {});
    // console.log('Combined attributes:', results.map(result => result.attributes.score));
    return {
      ...result,
      attributes: mergedAttributes,
      score: (results.reduce((memo, result) => memo + result.score, 0) / results.length),
      paths: results.reduce((memo, result) => [ ...memo, ...(result.paths || []) ], [])
    }
  });

  return averaged;
}

export function filterResults(results: TraversalResult[], resourceIndex): TraversalResult[] {
    return results.filter(result => {
      return !(result.type in Edges.ToSkip) && !(result.id in resourceIndex);
    });
}

// export function traverseAttributes(results: TraversalResult[]) {
//   const index = results.reduce((memo, result) => {
//     const { id } = result;
//     return {
//       ...memo,
//       [id]: result
//     };
//   }, {});
//
//   return results.map(result => {
//     // const parentAttributes = result.paths.
//     return {
//       ...result,
//       attributes: {
//         ...result.attributes
//       }
//     }
//   });
// }