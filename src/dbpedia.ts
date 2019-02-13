import qs from 'qs';
import fetch from 'node-fetch';

import { DBPEDIA_SPARQL_ENDPOINT } from './config';
import { Context } from 'feedbackfruits-knowledge-engine';
// import { DBPedia } from './builder/context';

// const { abstract, label, thumbnail, redirects } = DBPedia;

type URI = string;

type Mapping = {
  [key: string]: URI
};

type Entity<M extends Mapping> = {
  uri: string
} & {
  [K in keyof M]: string
};

const DEFAULT_MAPPING = {
  // name: label,
  // description: abstract,
  // image: thumbnail
};

type DefaultEntity = Entity<typeof DEFAULT_MAPPING>;

type DBPediaResponse = {
  results: {
    bindings: Array<{}>
  }
}

// export async function query(uri: URI): Promise<DefaultEntity>;
// export async function query<M extends Mapping>(uri: URI, mapping: M = <any> DEFAULT_MAPPING): Promise<Entity<M>> {
//   const what = Object.keys(mapping).map(key => `?${key}`).join(' ') + ' ?uri';
//   const where = Object.keys(mapping).map(key => `OPTIONAL { ?uri <${mapping[key]}> ?${key} . }`).join("\n");
//   const filter = Object.keys(mapping).map(key => `(!isLiteral(?${key}) || lang(?${key}) = 'en')`).join(" && ");
//
//   const query = `
//     SELECT DISTINCT ${what} WHERE {
//       {
//         values ?uri { <${uri}> }
//         ${where}
//       } UNION {
//         values ?alt_id { <${uri}> }
//         ?alt_id <${redirects}> ?uri .
//         ${where}
//       }
//       FILTER(${filter})
//     }
//   `;
//
//   const url = `${DBPEDIA_SPARQL_ENDPOINT}?${qs.stringify({ query, output: 'json' })}`;
//   console.log(`Fetching DBPedia entity:`, query);
//   return fetch(url)
//     .then(response => response.json<DBPediaResponse>())
//     .then(result => parseResult(result, mapping));
// }

export async function query(text: string, mapping = DEFAULT_MAPPING) {
  const url = `${DBPEDIA_SPARQL_ENDPOINT}?${qs.stringify({ query: text, output: 'json' })}`;
  // console.log(`Fetching DBPedia entity:`, text);
  return fetch(url)
    .then(response => response.json<DBPediaResponse>())
    .then(result => result);
}

export function parseResult<M extends Mapping>(result: DBPediaResponse, mapping: M): Entity<M> {
  let { bindings } = result.results;
  if (!bindings.length) throw Error(`Could not find entity`);
  let binding = bindings.length === 1 ? bindings[0] : bindings.reduce((memo, binding) => {
    if (!memo) return binding;
    if (Object.keys(binding).length > Object.keys(memo).length) return binding;
    return memo;
  }, null);

  let keys = Object.keys(mapping).concat('uri');
  return <Entity<M>>keys.reduce((memo, key) => {
    if (!(key in binding)) return memo;
    return { ...memo, [key]:  binding[key].value };
  }, {});
}

// query("http://dbpedia.org/resource/Sue_blackmore").then(console.log);

export default query;
