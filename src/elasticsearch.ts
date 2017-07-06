import elasticsearch = require("elasticsearch");

import {
  ELASTICSEARCH_ADDRESS,
  ELASTICSEARCH_INDEX_NAME
} from "./config";

const client = new elasticsearch.Client( {
  host: ELASTICSEARCH_ADDRESS,
  apiVersion: "5.x"
});

export function query(queryBody: string): Promise<object[]> {
  return new Promise((resolve, reject) => {
    client.search({
      index: ELASTICSEARCH_INDEX_NAME,
      body: queryBody
    }, (err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
  }).then((res: any) => {
    return res.hits.hits;
  });
}

export default query;
