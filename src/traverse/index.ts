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
  const byType = Query.groupByType(startingPoints)
  const query = Query.generateQuery(byType);
  // const queryKey = lowerCaseFirst(semtools.getLocalName(type));
  const results = await Query.query(schema, query);
  const parsed = Result.parseResults(results, byType);

  const threshold = 0.7;
  const { finished, unfinished } = parsed.reduce((memo, result) => {
    let { finished, unfinished } = memo;

    if ((result.score <= threshold) || (result.id in done)) finished = [].concat(finished, result);
    if ((result.score > threshold) && !(result.id in done)) unfinished = [].concat(unfinished, result);

    return {
      finished,
      unfinished
    };
  }, { finished: [] as Result.TraversalResult[], unfinished: [] as Result.TraversalResult[] });

  const newDone = {
    ...done,
    ...(finished.reduce((memo, result) => ({ ...memo, [result.id]: true }), {})),
    ...(unfinished.reduce((memo, result) => ({ ...memo, [result.id]: true }), {}))
  };

  console.log(`Entering recursion with ${unfinished.length} starting points, done ${Object.keys(newDone).length}.`);

  const recursed = (unfinished.length > 0) ? await _traverse(schema, unfinished, newDone) : [];

  return [
    ...finished,
    ...recursed
  ];
}

export type Traversal = Result.TraversalResult[];
export async function traverse(schema: GraphQLSchema, resources: string[]): Promise<Traversal> {
  const resourceIndex = resources.reduce((memo, id) => ({ ...memo, [id]: true }), {});
  const startingPoints = resources.map(id => {
    const type = Context.iris.$.Resource;
    const baseScore = Edges.EdgesFactors[type].factor;
    return { id, type, score: baseScore, paths: [ [] ], attributes: {} };
  });

  const results: Result.TraversalResult[] = await _traverse(schema, startingPoints, resourceIndex);

  // return results;
  return Result.filterResults(results, resourceIndex);
}

export * from './edges';
export * from './query';
export * from './result';
