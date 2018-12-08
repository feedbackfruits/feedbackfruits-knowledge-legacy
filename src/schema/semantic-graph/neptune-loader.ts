import * as DataLoader from 'dataloader';
import { Context } from 'feedbackfruits-knowledge-engine';
import fetch from 'node-fetch';
import * as qs from 'qs';
import * as md5 from 'md5';
import * as Query from './query';
import * as Config from '../../config'

export const encodeQuery = query => `_${md5(query)}`;

export async function queryNeptune(query: string): Promise<any> {
  const url = `${Config.NEPTUNE_READER_ENDPOINT}`;
  console.log(`Fetching Neptune entity:`, query);

  const now = Date.now();
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/sparql-query"
    },
    method: 'POST',
    body: query
  });

  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
    console.log('Neptune query took:' + (Date.now() - now)/1000 + ' seconds');
  } catch(e) {
    console.error(e);
    throw e;
  }

  return json;
}

export function invertObject(obj: { [index: string]: string }): { [index: string]: string } {
  return Object.entries(obj).reduce((memo, [ key, value ]) => ({ ...memo, [value]: key }), {});
}

export function dedupArray(arr: string[]) {
  return Object.keys(arr.reduce((memo, val) => ({ ...memo, [val]: true }), {}));
}

export function parseBindingValue(bindingValue) {
  if (bindingValue.type === 'uri') return bindingValue.value;
  if (bindingValue.type === 'literal') {
    if (bindingValue.datatype === 'http://www.w3.org/2001/XMLSchema#double') return parseFloat(bindingValue.value);
    return bindingValue.value;
  }
}

export function parseCompactedResult(result: any, predicateMap) {
  let { head: { vars }, results: { bindings } } = result;
  if (!bindings.length) return {};

  return bindings.reduce((memo, binding) => {
    const objectKeys = Object.keys(binding);
    const subject = parseBindingValue(binding.subject);
    const quads = objectKeys.filter(key => key !== 'subject').map(key => ({ subject, predicate: predicateMap[key], object: parseBindingValue(binding[key]) }));
    return quads.reduce((memo, quad) => {
      const { subject, predicate, object } = quad;
      if (!(subject in memo)) memo[subject] = { [predicate]: object };
      else if (!(predicate in memo[subject])) memo[subject][predicate] = object;
      else memo[subject][predicate] = dedupArray([].concat(memo[subject][predicate], object));

      return memo;
    }, memo)
  }, {});
}

export function parseQuery(query: Query.Query): { query: string, keys: { [index: string]: string } } {
  if (query.type === 'SimpleQuery') {
    const { subject, predicate } = query;
    const subjectKey = md5(`<${subject}>`);
    const objectKey = md5(`<${subject}> <${predicate.iri}>`);
    return { keys: { [predicate.iri]: objectKey }, query: `
      SELECT *
      WHERE {
        {
            values ?subject { <${subject}> }
            { ?subject <${predicate.iri}> ?${objectKey} }
        }
      }` };
  } else if (query.type === 'ReverseFilterQuery') {
    const { types, predicate, value } = query;
    return null;
  } else if (query.type === 'CompactedQuery') {
    const { subjects, predicates } = query;
    const predicateKeys = predicates.reduce((memo, predicate) => ({ ...memo, [predicate.iri]: md5(`${predicate.iri}`) }), {});
    // console.log('Predicate keys:', JSON.stringify(predicateKeys));
    const parsed = `
        ${predicates.map(predicate => {
        const objectKey = predicateKeys[predicate.iri];
        return `{
            SELECT *
            WHERE {
              VALUES (?subject) { ${subjects.map(subject => `( <${subject}> )`).join(' ')} }
              { ?subject <${predicate.iri}> ?${objectKey} }
            }
          }`
      }).join(' UNION ')}`;

    return { keys: predicateKeys, query: parsed };
  }
}

export function dedupQueries(queries: Query.SimpleQuery[]): Query.SimpleQuery[] {
  return Object.values(queries.reduce((memo, query) => {
    const { subject, predicate } = query;
    const objectKey = md5(`<${subject}> <${predicate.iri}>`);
    return {
      ...memo,
      [objectKey]: query
    }
  }, {}));
}

export const loader = new DataLoader<any, any>(async (loadables: Query.SimpleQuery[]) => {
  const deduped = dedupQueries(loadables);
  const grouped = Query.groupQueries(deduped);
  const parsed = grouped.map(parseQuery);
  // const parsed = deduped.map(parseQuery);
  const query = `
  SELECT *
  FROM NAMED ${Config.GRAPH}
  WHERE {
      GRAPH ${Config.GRAPH} {
        ${parsed.map(({ query }) => `{ ${query} }`).join(' UNION ')}
      }
  }
  `;

  console.log('Loading from Neptune...');

  const response = await queryNeptune(query);
  // console.log('Breaking after response:', JSON.stringify(response));
  const keyMap = parsed.reduce((memo, { keys }) => ({ ...memo, ...invertObject(keys) }), {});

  // console.log(`Using inverted keyMap:`, JSON.stringify(keyMap));

  const results = parseCompactedResult(response, keyMap);

  // console.log('Breaking after results:', JSON.stringify(results));

  const mappedResults = loadables.map(l => {
    return l.subject in results
      ? results[l.subject][l.predicate.iri]
      : undefined;
  });

  // console.log(`Mapped results back to:`, JSON.stringify(mappedResults));

  return mappedResults;

}, {
  maxBatchSize: 50
});

export async function resolveSourcePropertyValue(source, iri) {
  // console.log("Neptune: resolveSourcePropertyValue");
  const subject = source.id;
  const query = { type: 'SimpleQuery', subject, predicate: { iri, reverse: false } };
  const result = await loader.load(query);
  // console.log("Neptune: resolveSourcePropertyValue result", result);
  return result;
  // return null;
  // return simpleQuery(`<${source.id}>`, iri)
}

export async function resolveSourceTypes(source): Promise<string[]> {
  // console.log("Neptune: resolveSourceTypes");
  const subject = source.id;
  const query = { type: 'SimpleQuery', subject, predicate: { iri: Context.iris.rdf.type, reverse: false } };
  const result = await loader.load(query);
  // console.log("Neptune: resolveSourcePropertyValue result", result);
  return result;
  // return null;
  // return simpleQuery(`<${source.id}>`, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
}

export async function resolveResourcesByPredicate(types, iri, value) {
  // console.log("Neptune: resolveResourcesByPredicate");
  return null;
  // return reverseFilterQuery(types.map(type => `<${type}>`), iri, `<${value}>`);
};
