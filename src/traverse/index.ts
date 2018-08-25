import { GraphQLSchema } from 'graphql';
import { Context } from 'feedbackfruits-knowledge-engine';
import * as semtools from 'semantic-toolkit';

import * as Edges from './edges';
import * as Query from './query';
import * as Result from './result';

export type TraversalOptions = {
  baseScore?: number,
  threshold?: number
};


const lowerCaseFirst = (str: string): string => {
  return str[0].toLowerCase() + str.slice(1, str.length);
};

export async function _traverse(schema: GraphQLSchema, startingPoints: Result.TraversalResult[], done: { [index: string]: boolean }): Promise<Result.TraversalResult[]> {
  const query = Query.generateQuery(startingPoints);
  const queryKey = lowerCaseFirst(semtools.getLocalName(type));
  const result = await Query.query(schema, query);

  console.log('Got query result:', JSON.stringify(result));

  const results: Query.QueryResult[] = [].concat(result[queryKey] || []);
  const { baseScore = 1, threshold = 0.7 } = options;

  const parsed = await Result.parseResults(results, baseScore, basePaths);
  const { finished, unfinished } = parsed.reduce((memo, result) => {
    let { finished, unfinished } = memo;

    if (result.score <= threshold || result.id in done) finished = [].concat(finished, result);
    if (result.score > threshold) unfinished = [].concat(unfinished, result);

    return {
      finished,
      unfinished
    };
  }, { finished: [] as Result.TraversalResult[], unfinished: [] as Result.TraversalResult[] });

  const newDone = {
    ...done,
    ...(finished.reduce((memo, result) => ({ [result.id]: true }), {}))
  };

  const grouped: { [key: string]: Result.TraversalResult[] } = unfinished.reduce((memo, result) => {
    const { id } = result;
    return {
      ...memo,
      [id]: (id in memo ? [].concat(memo[id], result) : [ result ])
    }
  }, {});

  const deduplicated: Result.TraversalResult[] = Object.entries(grouped).map(([ id, results ]) => {
    const newScore = results.reduce((memo, result) => memo + result.score, 0) / results.length;
    const types = Object.keys(results.reduce((memo, result) => ({ ...memo, ...([].concat(result.type).reduce((memo, type) => ({ ...memo, [type]: true}), {}))}), {}));
    const paths = results.reduce((memo, result) => [ ...memo, ...result.paths ], []);

    return {
      id,
      type: types,
      score: newScore,
      paths
    }
  });

  const recursed = await Object.entries(deduplicated).reduce(async (memo, [ id, results ]) => {
    const _results = await _traverse(schema, id, type, { baseScore: score }, paths, newDone);
    return results.map((result) => {
      const { id, type, score, paths } = result;


      return [
        ...await memo,
      ];
    });
  }, Promise.resolve([] as Result.TraversalResult[]));

  const recursed = await unfinished.reduce(async (memo, result) => {
    const { id, type, score, paths } = result;
    const newDone = {
      ...done,
      ...(finished.reduce((memo, result) => ({ [result.id]: true }), {}))
    };
    const results = await _traverse(schema, id, type, { baseScore: score }, paths, newDone);
    return [
      ...await memo,
      ...results
    ];
  }, Promise.resolve([] as Result.TraversalResult[]));

  return [
    ...finished,
    ...unfinished,
    ...recursed
  ]
}

export type Traversal = Result.TraversalResult[];
export async function traverse(schema: GraphQLSchema, resources: string[]): Promise<Traversal> {
  const startingPoints = resources.map(id => {
    const type = Context.iris.$.Resource;
    const baseScore = Edges.EdgesFactors[type].factor;
    return { id, type, score: baseScore, paths: [] };
  });
  // TODO: Batch?

  const results: Result.TraversalResult[] = await _traverse(schema, startingPoints, {});
  // const results = await startingPoints.reduce(async (memo, { id, type, score }) => {
  //   return [
  //     ...await memo,
  //     ...results
  //   ]
  // }, Promise.resolve([] as Result.TraversalResult[]));

  const deduplicated = Result.deduplicateResults(results);
  return deduplicated;
}

export * from './edges';
export * from './query';
export * from './result';