import fetch from "node-fetch";
import * as qs from "qs";

import { DBPEDIA_SPARQL_ENDPOINT } from "./config";
import * as Logger from "./utils/logger";

type URI = string;

interface IMapping {
  [key: string]: URI;
}

type Entity<M extends IMapping> = {
  uri: string
} & {
  [K in keyof M]: string
};

interface IDBPediaResponse {
  results: {
    bindings: Array<{}>
  };
}

export async function query(text: string, mapping) {
  const url = `${DBPEDIA_SPARQL_ENDPOINT}?${qs.stringify({ query: text, output: "json" })}`;
  Logger.log(`Fetching DBPedia entity:`, text);
  return fetch(url)
    .then(response => response.json<IDBPediaResponse>())
    .then(result => parseResult(result, mapping));
}

export function parseResult<M extends IMapping>(result: IDBPediaResponse, mapping: M): Entity<M> {
  const { bindings } = result.results;
  if (!bindings.length) {
    throw Error(`Could not find entity`);
  }

  const selectedBinding = bindings.length === 1 ? bindings[0] : bindings.reduce((memo, binding) => {
    if (!memo) {
      return binding;
    }

    if (Object.keys(binding).length > Object.keys(memo).length) {
      return binding;
    }

    return memo;
  }, null);

  const keys = Object.keys(mapping).concat("uri");
  return keys.reduce((memo, key) => {
    if (!(key in selectedBinding)) {
      return memo;
    }

    return { ...memo, [key]:  selectedBinding[key].value };
  }, {}) as Entity<M>;
}

export default query;
