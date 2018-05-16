import fetch, { Response } from "node-fetch";

import {
  CAYLEY_ADDRESS
} from "./config";

export function query(queryBody: string): Promise<Response> {
  console.log(`Sending query to ${CAYLEY_ADDRESS} :`, queryBody);
  const url = `${CAYLEY_ADDRESS}api/v1/query/graphql`;
  return fetch(url, {
    method: "post",
    body: queryBody,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    }
  }).then(response => response.json() as Promise<{ data: any, errors?: any[] }>).then((res) => {
    if ("errors" in res) {
      throw new Error(`CAYLEY: ${JSON.stringify(res.errors)}`);
    }

    if ("data" in res) {
      return res.data;
    }
  });
}

export default query;
