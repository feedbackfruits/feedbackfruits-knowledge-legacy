import elasticsearch = require("elasticsearch");

import {
  ELASTICSEARCH_ADDRESS,
  ELASTICSEARCH_INDEX_NAME
} from "./config";

const client = new elasticsearch.Client( {
  host: ELASTICSEARCH_ADDRESS,
  apiVersion: "5.x"
});

type SearchResult = { _score: number, _source: object };
type SearchResults = {
  meta: {
    from: number,
    size: number,
    total: number
  }
  results: SearchResult[]
}

export async function query(index: string, type: string, queryBody: string, from: number, size: number): Promise<SearchResults> {
  const res = await new Promise<{ hits: { hits: SearchResult[], total: number }}>((resolve, reject) => {
    client.search({
      index: index === ELASTICSEARCH_INDEX_NAME ? index :`${ELASTICSEARCH_INDEX_NAME}_${index}`,
      type,
      body: queryBody,
      from,
      size,
    }, (err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
  });

  const results = res.hits.hits;
  const total = res.hits.total;

  return {
    meta: {
      from,
      size,
      total
    },
    results
  };
}

export default query;
