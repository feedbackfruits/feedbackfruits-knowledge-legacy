import fetch, { Response } from 'node-fetch';

import {
  CAYLEY_ADDRESS
} from './config';

export function query(query: string): Promise<Response> {
  let url = `${CAYLEY_ADDRESS}api/v1/query/graphql`;
  return fetch(url, {
    method: 'post',
    body: query,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    }
  }).then(response => response.json()).then((res) => {
    if ('errors' in res) throw `CAYLEY: ${JSON.stringify(res['errors'])}`;
    if ('data' in res) return res['data'];
  });
};

export default query;
