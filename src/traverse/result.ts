import * as semtools from 'semantic-toolkit';

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
};

export type Path = string[];

export async function parseResult(result: Query.QueryResult, baseScore: number, basePaths: string[][]) {
  console.log(`Parsing result with baseScore ${baseScore}:`, result)
  const { id } = result;
  const types = Object.keys([].concat(result.type || []).map(type => type.id as string).reduce((memo, type) => ({ ...memo, [type]: true }), {}));
  const relevantTypes = types.filter(type => type in Edges.EdgesFactors);

  console.log(`Found ${relevantTypes.length} relevant types:`, relevantTypes.join(', '));
  // const edge = { factor: 1 };
  // const { factor } = edge;
  const scored = await relevantTypes.reduce(async (memo, type) => {
    const edges = Edges.EdgesFactors[type];
    const attributes = Edges.Attributes[type] || {};

    const localAttributes = Object.entries(attributes).reduce((memo, [ key, value ]) => {
      const localName = semtools.getLocalName(key);
      return {
        ...memo,
        [localName]: value
      }
    }, {});

    console.log(`Testing result against local attributes: ${JSON.stringify(localAttributes)}:`, result);

    const attributeValues = Object.entries(result).reduce((memo, [ key, value ]) => {
      console.log(`${key} in localAttributes?`, key in localAttributes);
      if (!(key in localAttributes && localAttributes[key])) return memo;
      return {
        ...memo,
        [key]: value
      };
    }, {});

    console.log(`Got attributeValues for ${id}:`, attributeValues);

    return Object.entries(edges).reduce(async (memo, [ key, edgeFactor ]) => {
      if (key === 'factor') return memo;

      const edgeKey = lowerCaseFirst(semtools.getLocalName(key));
      const edgeValues = [].concat(result[edgeKey] || []);
      const { factor } = edgeFactor as Edges.EdgeFactor;
      const edgeScore = baseScore * factor;

      // console.log(`Calculating edge score for ${edgeKey} on ${id} with edgeValue:`, edgeValue);
      // console.log(`Edge score: ${baseScore} * ${factor} * 0.5 = ${edgeScore}`);

      const results: TraversalResult[] = edgeValues.reduce((memo, edgeValue) => {

        const relevantEdgeTypes = [].concat(edgeValue.type || []).map(type => type.id).filter(type => type in Edges.EdgesFactors);
        if (relevantEdgeTypes.length === 0) return memo;

        return relevantEdgeTypes.reduce((memo, edgeType) => {
          const typeFactor = Edges.EdgesFactors[edgeType].factor;
          // const attributes = Edges.Attributes[edgeType] || {};
          // const attributeValues = Object.entries(edgeValue).reduce((memo, [ key, value ]) => {
          //   if (!(key in attributes && attributes[key])) return memo;
          //   return {
          //     ...memo,
          //     [key]: value
          //   };
          // }, {});

          const traversalResult = { id: edgeValue.id, type: edgeType, attributes: attributeValues, score: edgeScore * typeFactor, paths: basePaths.map(path => [ ...path, key ]) };
          return [
            ...memo,
            traversalResult
          ];
        }, memo);


      }, [] as TraversalResult[]);

      const recursed = await parseResults(edgeValues, edgeScore, basePaths.map(path => [ ...path, key ]));

      return [
        ...await memo,
        ...results,
        ...recursed
      ]

    }, Promise.resolve(memo));
    // console.log(`Calculating ${id} score for edges of type ${type}`);
    // return { id, type, score: newScore };
  }, Promise.resolve([] as TraversalResult[]));

  return scored;
}

export async function parseResults(results: Query.QueryResult[], baseScore: number = 1, basePaths: string[][]): Promise<TraversalResult[]> {
  const parsed = await results.reduce(async (memo: Promise<TraversalResult[]>, result) => {
    return [
      ... await parseResult(result, baseScore, basePaths),
      ... await memo
    ];
  }, Promise.resolve([] as TraversalResult[]));

  // return parsed;
  const deduplicated =  deduplicateResults(parsed);
  return deduplicated;
}

export function deduplicateResults(results: TraversalResult[]): TraversalResult[] {
  const grouped = Object.values<TraversalResult[]>(results.reduce((memo, result) => {
    const key = result.id;

    // TODO: Maybe weighted sum of scores here?
    if (key in memo) memo[key] = [ ...memo[key], result ];

    memo[key] = [ result ];

    return memo;
  }, {}));

  const averaged = grouped.map(results => {
    const [ result ] = results;
    console.log('Results length:', results.length);
    return {
      ...result,
      score: (results.reduce((memo, result) => memo + result.score, 0) / results.length),
      paths: results.reduce((memo, result) => [ ...memo, ...(result.paths || []) ], [])
    }
  });

  return averaged;
}