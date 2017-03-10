import fetch from 'node-fetch';

import {
  CAYLEY_ADDRESS
} from '../config';


function query(query) {
  let url = `${CAYLEY_ADDRESS}api/v1/query/graphql`;
  return fetch(url, {
    method: 'post',
    body: query,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    }
  }).then(response => response.json());
};

export default query;
