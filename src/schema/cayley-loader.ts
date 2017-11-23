import * as DataLoader from 'dataloader';
import md5 = require('md5');

import cayley from "../cayley";

export const encodeQuery = query => `_${md5(query)}`;

export const loader = new DataLoader<string, any>(async queries => {
  const query = `{
    ${queries.map((query, i) => `
      ${encodeQuery(query)}: ${query}
    `)}
  }`;

  const response = await cayley(query);
  const results = queries.map((query) => response[encodeQuery(query)]);
  return results;
});

export default loader;
