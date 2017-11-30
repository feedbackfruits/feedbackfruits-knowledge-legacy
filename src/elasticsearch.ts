import elasticsearch = require("elasticsearch");

import {
  ELASTICSEARCH_ADDRESS,
  ELASTICSEARCH_INDEX_NAME
} from "./config";

const client = new elasticsearch.Client( {
  host: ELASTICSEARCH_ADDRESS,
  apiVersion: "5.x"
});

export function query(type: string, queryBody: string): Promise<object[]> {
  return new Promise((resolve, reject) => {
    client.search({
      index: ELASTICSEARCH_INDEX_NAME,
      type,
      body: queryBody
    }, (err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
  }).then((res: any) => {
    return res.hits.hits;
  }, (error: any) => {
    console.error('ElasticSearch failed:', error);
    throw error;
  });
}

export default query;
