import fetch from 'node-fetch';
import * as qs from 'qs';

import { DBPEDIA_SPARQL_ENDPOINT } from './config';
import { ABSTRACT, LABEL, THUMBNAIL } from './context';

export function getEntity(id) {
  console.log('getting entity', id)
  const params = {
    'default-graph-uri': 'http://dbpedia.org',
    'format': 'application/sparql-results+json',
    'query': `
      SELECT DISTINCT ?abstract ?label ?thumbnail WHERE {
        ?object <${ABSTRACT}> ?abstract .
        ?object <${LABEL}> ?label .
        ?object <${THUMBNAIL}> ?thumbnail .

        FILTER (
          ?object = <${id}> &&
          langMatches(lang(?abstract), "EN") &&
          langMatches(lang(?label), "EN")
        )
      }
    `
  };

  const url = `${DBPEDIA_SPARQL_ENDPOINT}?${qs.stringify(params)}`

  return fetch(url).then(response => response.json()).then(result => {
    if (!result.results.bindings.length) throw Error(`Could not find entity ${id}`);

    const { label, abstract, thumbnail } = result.results.bindings[0];
    return {
      id,
      name: label.value,
      description: abstract.value,
      thumbnail: thumbnail.value
    };
  });
}
