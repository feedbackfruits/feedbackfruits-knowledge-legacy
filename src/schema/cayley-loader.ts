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

export type SimpleQuery = {
  type: 'SimpleQuery',
  subject: string,
  predicate: CayleyGraphQLPredicate
};

export type ReverseFilterQuery = {
  type: 'ReverseFilterQuery',
  types: string[]
  predicate: CayleyGraphQLPredicate,
  value: string
};

export type CompactedQuery = {
  type: 'CompactedQuery',
  subjects: string[],
  predicates: CayleyGraphQLPredicate[]
};

export type Query = SimpleQuery | ReverseFilterQuery | CompactedQuery;

// This maps predicates defined in the ontology to the predicates used in the database.
// This hack is needed until semantic-graphql is able to follow subPropertyOf paths through the resolvers
export function mapPredicate(iri: string): CayleyGraphQLPredicate {
  if (iri in predicateMap) return predicateMap[iri];
  return { iri, reverse: false };
}

export const encodeQuery = query => `_${md5(query)}`;

export function parseQuery(query: Query): string {
  if (query.type === 'SimpleQuery') {
    const { subject, predicate } = query;
    return `
      nodes(id: "${subject}") {
        ${predicate.iri} ${predicate.reverse ? ' @rev' : ''} {
          id
        }
      }`;
  } else if (query.type === 'ReverseFilterQuery') {
    const { types, predicate, value } = query;
    return `
      nodes(${predicate.iri}: "${value}", http://www.w3.org/1999/02/22-rdf-syntax-ns#type: ${JSON.stringify(types)}) {
        id
      }`
  } else if (query.type === 'CompactedQuery') {
    const { subjects, predicates } = query;
    return `
      nodes(id: ${JSON.stringify(subjects)}) {
        id
        ${predicates.map(predicate => {
          return `${predicate.iri} ${predicate.reverse ? ' @rev' : ''} {
            id
          }`;
        }).join('\n')}
      }`
  }
}

export function groupQueries(queries: Query[]): CompactedQuery[] {
  console.log(`GROUP: Grouping ${queries.length} queries`);
  const simple = <SimpleQuery[]>queries.filter(q => q.type === 'SimpleQuery');
  // const reverse = <ReverseFilterQuery[]>queries.filter(q => q.type === 'ReverseFilterQuery');

  // Group by subject
  const bySubject = simple.reduce((memo, query) => {
    const { subject, predicate } = query;

    if (!(subject in memo)) memo[subject] = { [predicate.iri]: predicate.reverse };
    else memo[subject] = { ...memo[subject], [predicate.iri]: predicate.reverse };

    return memo;
  }, { });

  // Group groups by same predicates
  const groupedGroups = Object.entries(bySubject).reduce((memo, [ subject, predicates ]) => {
    const predicatesString = JSON.stringify(Object.keys(predicates).sort());

    if (!(predicatesString in memo)) memo[predicatesString] = { [subject]: predicates };
    else memo[predicatesString] = { ...memo[predicatesString], [subject]: predicates };

    return memo;
  }, {});

  // Turn grouped groups into compacted queries
  const compacted = Object.entries(groupedGroups).map(([ predicatesString, subjectsObj ]) => {
    const subjects = Object.keys(subjectsObj);
    const predicates: CayleyGraphQLPredicate[] = Object.entries(subjectsObj[subjects[0]]).map(([ iri, reverse ]) => {
      return { iri, reverse };
    });
    return { type: 'CompactedQuery', subjects, predicates };
  });

  // const grouped = queries;
  console.log(`GROUP: Retuning ${compacted.length} queries`);
  return <any[]>compacted;
}

export function ungroupResults(results: any[], queries: CompactedQuery[]): any[] {
  // const reduced = queries.reduce(() => {
  //
  // });
  return results;
}

export async function queryMany(queriesObj: { [index: string]: SimpleQuery }): Promise<{ [index: string]: any }> {
  const queries = Object.values(queriesObj);
  const grouped = groupQueries(queries);
  // console.log('Grouped queries:', grouped);

  const groupedBySubject = grouped.reduce((memo, query) => {
    const { subjects } = query;
    return subjects.reduce((memo, subject) => ({ ...memo, [subject]: query }), memo);
  }, {});

  const mapped = queries.map(query => {
    const { subject, predicate } = query;
    if (subject in groupedBySubject) return groupedBySubject[subject];
    return query;
  }).map(parseQuery);

  // console.log('Mapped:', mapped.map(m => ({ q: m, encoded: encodeQuery[m] })));

  const parsed = grouped.map(parseQuery);
  const query = `{
    ${parsed.map((query, i) => `
      ${encodeQuery(query)}: ${query}
    `)}
  }`;

  const response = await cayley(query);
  // console.log('Response:', response);
  const results = parsed.map(query => response[encodeQuery(query)]);
  // console.log('Got grouped results:', results);
  const resultsBySubject = results.reduce((memo, result) => {
    if (!(result instanceof Array)) return { ...memo, [`<${result.id}>`]: result };
    return result.reduce((memo, result) => {
      return { ...memo, [`<${result.id}>`]: result };
    }, memo);
  }, {});

  // console.log('Results by subject:', resultsBySubject);
  const byHash = Object.entries(queriesObj).reduce((memo, [ hash, query ]) => {
    const { subject } = query;
    // console.log('Matching subject:', subject)
    const result = resultsBySubject[subject];
    return { ...memo, [hash]: result };
  }, {});

  // console.log('Results by hash:', byHash);
  return byHash;

  // const results = mapped.map((query) => {
  //   const result = response[encodeQuery(query)];
  //   return result;
  // });
  // console.log('Results:', results);
  // const ungrouped = ungroupResults(results, grouped);
  // return results;
}

export const loader = new DataLoader<Query, any>(async queries => {
  const queriesObj = queries.reduce((memo, query) => {
    console.log('Reducing queries:', JSON.stringify(query));
    if (query.type !== 'SimpleQuery') return memo;
    const hash = encodeQuery(parseQuery(query));
    return { ...memo, [hash]: query };
  }, {});

  // console.log('Awaiting queryMany...');
  const results = await queryMany(<any>queriesObj);
  // console.log('Retuning results:', results);
  return Object.values(results);
  // const grouped = groupQueries(queries);
  // // console.log('Grouped queries:', grouped);
  //
  // const groupedBySubject = grouped.reduce((memo, query) => {
  //   const { subjects } = query;
  //   return subjects.reduce((memo, subject) => ({ ...memo, [subject]: query }), memo);
  // }, {});
  //
  // const mapped = queries.map(query => {
  //   if (query.type !== 'SimpleQuery') return query;
  //   const { subject, predicate } = query;
  //   if (subject in groupedBySubject) return groupedBySubject[subject];
  //   return query;
  // }).map(parseQuery);
  //
  // // console.log('Mapped:', mapped.map(m => ({ q: m, encoded: encodeQuery[m] })));
  //
  // const parsed = grouped.map(parseQuery);
  // const query = `{
  //   ${parsed.map((query, i) => `
  //     ${encodeQuery(query)}: ${query}
  //   `)}
  // }`;
  //
  // const response = await cayley(query);
  // // console.log('Response:', response);
  // const results = mapped.map((query) => {
  //   const result = response[encodeQuery(query)];
  //   return result;
  // });
  // // console.log('Results:', results);
  // // const ungrouped = ungroupResults(results, grouped);
  // return results;
}, {
  maxBatchSize: 1000,
});


export async function simpleQuery(subject: string, iri: string): Promise<any> {
  const predicate = mapPredicate(iri);

  const query: SimpleQuery = { type: 'SimpleQuery', subject, predicate };
  // const query =  `
  //   nodes(id: "${subject}") {
  //     ${predicate.iri} ${predicate.reverse ? ' @rev' : ''}
  //   }`;

  const result = await loader.load(query);
  if (result instanceof Array) return result.map(res => res[predicate.iri].id);
  if (result[predicate.iri] instanceof Array) return result[predicate.iri].map(res => res.id);
  return result[predicate.iri].id;
}

export async function reverseFilterQuery(types, iri, value) {
  const predicate = mapPredicate(iri);

  const query: ReverseFilterQuery = { type: 'ReverseFilterQuery', types, predicate, value };
  // const query =  `
  //   nodes(${predicate.iri}: "${value}", http://www.w3.org/1999/02/22-rdf-syntax-ns#type: ${JSON.stringify(types)}) {
  //     id
  //   }`;

  const result = await loader.load(query);
  return result ? result : [];
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
