import md5 = require('md5');

export type Predicate = {
  iri: string
  reverse: boolean
};

export type SimpleQuery = {
  type: 'SimpleQuery',
  subject: string,
  predicate: Predicate
};

export type ReverseFilterQuery = {
  type: 'ReverseFilterQuery',
  types: string[]
  predicate: Predicate,
  value: string
};

export type CompactedQuery = {
  type: 'CompactedQuery',
  subjects: string[],
  predicates: Predicate[]
};

export type Query = SimpleQuery | ReverseFilterQuery | CompactedQuery;

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

  // Group by subject
  const bySubject = simple.reduce<{ [index: string]: { [index: string]: boolean } }>((memo, query) => {
    const { subject, predicate } = query;

    if (!(subject in memo)) memo[subject] = { [predicate.iri]: predicate.reverse };
    else memo[subject] = { ...memo[subject], [predicate.iri]: predicate.reverse };

    return memo;
  }, { });

  // Group groups by same predicates
  const groupedGroups = Object.entries(bySubject).reduce<{ [index: string]: { [index: string]: { [index: string]: boolean } } }>((memo, [ subject, predicates ]) => {
    const predicatesString = JSON.stringify(Object.keys(predicates).sort());

    if (!(predicatesString in memo)) memo[predicatesString] = { [subject]: predicates };
    else memo[predicatesString] = { ...memo[predicatesString], [subject]: predicates };

    return memo;
  }, {});

  // Turn grouped groups into compacted queries
  const compacted = Object.entries(groupedGroups).map(([ predicatesString, subjectsObj ]) => {
    const subjects = Object.keys(subjectsObj);
    const predicates: Predicate[] = Object.entries(subjectsObj[subjects[0]]).map(([ iri, reverse ]) => {
      return { iri, reverse };
    });
    return { type: 'CompactedQuery', subjects, predicates };
  });

  // const grouped = queries;
  console.log(`GROUP: Retuning ${compacted.length} queries`);
  return <any[]>compacted;
}

export async function compactQueries(queries: Query[] ): Promise<Query[]> {
  const simple: SimpleQuery[] = <any>queries.filter(query => query.type === 'SimpleQuery');
  const reverse: ReverseFilterQuery[] = <any>queries.filter(query => query.type === 'ReverseFilterQuery');
  const grouped = groupQueries(simple);
  // console.log('Grouped queries:', grouped);

  const groupedBySubject = grouped.reduce((memo, query) => {
    const { subjects } = query;
    return subjects.reduce((memo, subject) => ({ ...memo, [subject]: query }), memo);
  }, {});

  return [ ...grouped, ...reverse ];
}

// export async function simpleQuery(subject: string, iri: string): Promise<any> {
//   const predicate = { iri, reverse: false };
//
//   const query: SimpleQuery = { type: 'SimpleQuery', subject, predicate };
//   // const query =  `
//   //   nodes(id: "${subject}") {
//   //     ${predicate.iri} ${predicate.reverse ? ' @rev' : ''}
//   //   }`;
//
//   const result = await loader.load(query);
//
//   console.log('Checking res:', result);
//
//   try {
//     if (result == null) return result;
//     if (result instanceof Array) return result.map(res => res[predicate.iri] != null ? res[predicate.iri].id : res[predicate.iri]);
//     if (result[predicate.iri] instanceof Array) return result[predicate.iri].map(res => res != null ? res.id : res);
//     return result[predicate.iri] != null ? result[predicate.iri].id : result[predicate.iri];
//   } catch(e) {
//     console.log('Broke on res:', result);
//     throw e;
//   }
// }
//
// export async function reverseFilterQuery(types, iri, value) {
//   const predicate = { iri, reverse: false };
//
//   const query: ReverseFilterQuery = { type: 'ReverseFilterQuery', types, predicate, value };
//   // const query =  `
//   //   nodes(${predicate.iri}: "${value}", http://www.w3.org/1999/02/22-rdf-syntax-ns#type: ${JSON.stringify(types)}) {
//   //     id
//   //   }`;
//
//   const result = await loader.load(query);
//   return result ? result : [];
// }
//
