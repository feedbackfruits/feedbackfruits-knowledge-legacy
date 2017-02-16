import fetch from 'node-fetch';
import cayley = require('cayley-node');

import {
  CAYLEY_ADDRESS,
  MAG_API_ENDPOINT
} from './config';


// const client = cayley(CAYLEY_ADDRESS, {
//   promisify: true
// });
const client = cayley(CAYLEY_ADDRESS);
const graph = client.g;

export type DBPediaPointer = {
  id: string
}

export function getEntityDetails(id) {
  const url = `${MAG_API_ENDPOINT}?entityId=${id}&correlationId=1`;
  return fetch(url).then(response => response.json());
}

export function getParents(id): Promise<DBPediaPointer[]> {
  console.log(`Getting parents for ${id}`);
  return new Promise((resolve, reject) => {
    graph
      .V(`<${id}>`)
      .Out("<http://schema.org/sameAs>")
      .Out("<http://academic.microsoft.com/parentFieldOfStudy>")
      .In("<http://schema.org/sameAs>")
      .All((err, res) => {
        if (err) return reject(err);
        return resolve(res.result);
      });
  });

};

export function getChildren(id): Promise<DBPediaPointer[]> {
  console.log(`Getting children for ${id}`);
  return new Promise((resolve, reject) => {
    graph
      .V(`<${id}>`)
      .Out("<http://schema.org/sameAs>")
      .Out("<http://academic.microsoft.com/childFieldOfStudy>")
      .In("<http://schema.org/sameAs>")
      .All((err, res) => {
        if (err) return reject(err);
        return resolve(res.result);
      });
  });

};

export default {
  getParents,
  getChildren
}
