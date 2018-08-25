import elasticsearch = require("elasticsearch");

import {
  ELASTICSEARCH_ADDRESS,
} from "../config";

const client = new elasticsearch.Client( {
  host: ELASTICSEARCH_ADDRESS,
  apiVersion: "5.x"
});

export type SearchResult = { _score: number, _source: object };
export type SearchResults = {
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
      index,
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
