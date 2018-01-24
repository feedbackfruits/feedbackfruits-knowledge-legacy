import * as DataLoader from 'dataloader';
import md5 = require('md5');

import cayley from "../cayley";

const predicateMap: { [key: string]: CayleyGraphQLPredicate } = {
  // This breaks because semantic-graphql can't deal with IRIs with the same local name
  // 'http://www.w3.org/2002/07/owl#sameAs': 'http://schema.org/sameAs',
  // 'https://knowledge.express/entity': { iri: 'http://schema.org/sameAs', reverse: false },
  'https://knowledge.express/fieldOfStudy': { iri: 'http://schema.org/sameAs', reverse: true },

  // This works but it breaks because it tries to get too much data. Retry when pagination is implemented
  // 'http://www.w3.org/2000/01/rdf-schema#member': { iri: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', reverse: true }
};

export type CayleyGraphQLPredicate = { iri: string, reverse: boolean };

// This maps predicates defined in the ontology to the predicates used in the database.
// This hack is needed until semantic-graphql is able to follow subPropertyOf paths through the resolvers
export function mapPredicate(iri: string): CayleyGraphQLPredicate {
  if (iri in predicateMap) return predicateMap[iri];
  return { iri, reverse: false };
}

export const encodeQuery = query => `_${md5(query)}`;

export const loader = new DataLoader<string, any>(async queries => {
  const query = `{
    ${queries.map((query, i) => `
      ${encodeQuery(query)}: ${query}
    `)}
  }`;

  const response = await cayley(query);
  const results = queries.map((query) => response[encodeQuery(query)]);
  return results;
});


export async function simpleQuery(subject: string, iri: string): Promise<any> {
  const predicate = mapPredicate(iri);

  const query =  `
    nodes(id: "${subject}") {
      ${predicate.iri} @opt ${predicate.reverse ? ' @rev' : ''}
    }`;

  const result = await loader.load(query);
  return result[predicate.iri];
}

export async function reverseFilterQuery(types, iri, value) {
  const predicate = mapPredicate(iri);

  const query =  `
    nodes(${predicate.iri}: "${value}", http://www.w3.org/1999/02/22-rdf-syntax-ns#type: ${JSON.stringify(types)}) {
      id
    }`;

  const result = await loader.load(query);
  return result ? result : [];
}

export async function resolveSourceId(source) {
  return `${source.id}`;
}

export async function resolveSourcePropertyValue(source, iri) {
  return simpleQuery(`<${source.id}>`, iri)
}

export async function resolveSourceTypes(source): Promise<string[]> {
  return simpleQuery(`<${source.id}>`, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
}

export async function resolveResourcesByPredicate(types, iri, value) {
  return reverseFilterQuery(types.map(type => `<${type}>`), iri, `<${value}>`);
};
