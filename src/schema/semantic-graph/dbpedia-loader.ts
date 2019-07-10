import DataLoader from 'dataloader';
import fetch from 'node-fetch';
import qs from 'qs';
import md5 from 'md5';

import { DBPEDIA_SPARQL_ENDPOINT } from '../../config';
import DBPedia from "../../dbpedia";

export const encodeQuery = query => `_${md5(query)}`;

export type DBPediaResponse = {
  head: {
    link: any,
    vars: string[]
  }
  results: {
    distinct: boolean,
    order: boolean,
    bindings: Array<Object>
  }
};

export async function queryDBPedia(text: string): Promise<DBPediaResponse> {
  const url = `${DBPEDIA_SPARQL_ENDPOINT}?${qs.stringify({ query: text, output: 'json' })}`;
  // console.log(`Fetching DBPedia entity:`, text);
  return fetch(url, {
    method: 'POST',
  })
    .then(response => response.json())
    .then(result => result);
}

export function parseResult(result: DBPediaResponse) {
  let { head: { vars }, results: { bindings } } = result;
  if (!bindings.length) throw Error(`Could not find entity`);

  const res = vars.reduce((memo, key) => {
    return bindings.reduce((memo, binding) => {
      const [ objectKey ] = Object.keys(binding);

      if (key === objectKey) memo[key] = (key in memo && memo[key] != binding[key].value) ? Object.keys([].concat(memo[key], binding[key].value).reduce((memo, value) => ({ ...memo, [value]: true }), {})) : binding[key].value;

      return memo;
    }, memo);
  }, {});

  return res;

}

export const loader = new DataLoader<any, any>(async (loadables: any) => {
  const query = `
  SELECT * WHERE {
    ${loadables.map(l => `{ ${l.query} }`).join(' UNION ')}
  }
  `;

  // console.log('Loading DBPedia:', query);

  const response = await queryDBPedia(query);
  console.log('Breaking after response:', JSON.stringify(response));
  const results = parseResult(response);
  console.log('Breaking after results:', JSON.stringify(results));

  return loadables.map(({ key }) => {
    return results[key];
  });
}, {
  maxBatchSize: 12
});

export async function resolveSourcePropertyValue(source, iri) {
  console.log("DBPedia: resolveSourcePropertyValue");
  const subjectKey = md5(`<${source.id}>`);
  const objectKey = md5(`<${source.id}> <${iri}>`);
  const query = `
  SELECT ?${objectKey}
  WHERE
  {
    {
      values ?${subjectKey} { <${source.id}> }
      OPTIONAL { ?${subjectKey} <${iri}> ?${objectKey} }
     }
    FILTER((!isLiteral(?${objectKey}) || lang(?${objectKey}) = 'en'))
  }
  `;
  const result = await loader.load({ query, key: objectKey });
  console.log("DBPedia: resolveSourcePropertyValue result", result);
  return result;
  // return simpleQuery(`<${source.id}>`, iri)
}

export async function resolveSourceTypes(source): Promise<string[]> {
  console.log("DBPedia: resolveSourceTypes");
  return null;
  // return simpleQuery(`<${source.id}>`, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
}

export async function resolveResourcesByPredicate(types, iri, value) {
  console.log("DBPedia: resolveResourcesByPredicate");
  return null;
  // return reverseFilterQuery(types.map(type => `<${type}>`), iri, `<${value}>`);
};
