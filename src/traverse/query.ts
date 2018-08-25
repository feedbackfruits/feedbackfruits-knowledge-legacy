import { graphql, GraphQLSchema } from 'graphql';
import { Edges, EdgesFactors, Attributes } from './edges';
import * as semtools from 'semantic-toolkit';

export type Query = string;
export type Queryable = {
  id: string,
  type: string
}

const lowerCaseFirst = (str: string): string => {
  return str[0].toLowerCase() + str.slice(1, str.length);
};

function mapEdges(edges: Edges): string {
  return Object.entries(edges).map(([ key, value]) => {
    if (key === 'factor') return 'id, type { id }';
    const queryKey = lowerCaseFirst(semtools.getLocalName(key));
    if (typeof value === 'number') return `${queryKey} { id, type { id } }`;
    return `${queryKey} { ${mapEdges(value as Edges)} }`;
  }).join('\n');
}

export function generateQuery(queryables: Queryable[]): Query {
  const byType: { [key: string]: Queryable[] } = queryables.reduce((memo, queryable) => {
    const { type } = queryable;
    return {
      ...memo,
      [type]: type in memo ? [].concat(memo[type], queryable) : [ queryable ]
    }
  }, {});

  const queries = Object.entries(byType).map(([ type, queryables ]) => {
    const ids = queryables.map(q => q.id);
    const query = _generateQuery(type, ids);
  });

  return `query {
    ${queries.join("\n")}
  }`;
}

export function _generateQuery(type: string, ids: string[]): Query {
  const queryKey = lowerCaseFirst(semtools.getLocalName(type));
  const edges = EdgesFactors[type] || {};
  const attributesQuery = Object.entries(type in Attributes ? Attributes[type] : {}).map(([ attributeKey, value ]) => {
    if (value !== true) return null;
    return semtools.getLocalName(attributeKey);
  }).filter(x => x).join('\n');

  // console.log("Attributes query:", attributesQuery);

  const query = `
    ${queryKey}(id: "${JSON.stringify(ids)}") {
      id
      type {
        id
      }
      ${mapEdges(edges)}
      ${attributesQuery}
    }
  `;

  return query;
}

export type ObjectToken = { id: string };
export interface QueryResultToken extends ObjectToken {
  type: ObjectToken | ObjectToken[]
  // [index: string]: string | string[] | QueryResult | QueryResult[]
};
export type QueryResult = QueryResultToken & {
  [index: string]: QueryResultToken
};

export async function query(schema: GraphQLSchema, query: Query): Promise<QueryResult> {
  console.log('Querying schema...', query);
  try {
    const { data, errors } = await graphql(schema, query);
    if (errors) throw new Error(JSON.stringify(errors));
    // console.log('Query result:', data);
    return data as QueryResult;
  } catch(e) {
    console.error('Broke while querying schema.');
    console.error(e);
    throw e;
  }
}