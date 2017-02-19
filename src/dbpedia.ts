import fetch from 'node-fetch';
import * as qs from 'qs';

import { DBPEDIA_SPARQL_ENDPOINT } from './config';
import { ABSTRACT, LABEL, THUMBNAIL, REDIRECTS } from './context';

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
  name: LABEL,
  description: ABSTRACT,
  thumbnail: THUMBNAIL
};

type DefaultEntity = Entity<typeof DEFAULT_MAPPING>;

export async function get<M extends Mapping>(uri: URI, mapping: M = <any> DEFAULT_MAPPING): Promise<Entity<M>> {
  const what = Object.keys(mapping).map(key => `?${key}`).join(' ') + ' ?uri';
  const where = Object.keys(mapping).map(key => `?uri <${mapping[key]}> ?${key} .`).join("\n");
  const filter = Object.keys(mapping).map(key => `!isLiteral(?${key}) || lang(?${key}) = "" || langMatches(lang(?${key}), "EN")`).join(" && ");

  const query = `
    SELECT DISTINCT ${what} WHERE {
      {
        values ?uri { <${uri}> }
        ${where}
      } UNION {
        values ?alt_id { <${uri}> }
        ?alt_id <${REDIRECTS}> ?uri .
        ${where}
      }

      FILTER(${filter})
    }
  `;

  const url = `${DBPEDIA_SPARQL_ENDPOINT}?${qs.stringify({ query })}`;

  return fetch(url).then(response => response.json()).then(result => {
    if (!result.results.bindings.length) throw Error(`Could not find entity`);

    return Object.keys(mapping).concat('uri').reduce((memo, key) => {
      return { ...memo, [key]: result.results.bindings[0][key].value };
    }, {});
  });
}
