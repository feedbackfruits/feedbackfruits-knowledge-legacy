import * as DataLoader from 'dataloader';
import md5 = require('md5');

import cayley from "./cayley";

export const encodeQuery = (query) => `_${md5(query)}`;

export const loader = new DataLoader<string, any>(async queries => {
  console.log('I am a loader!', queries);
  // return queries.map(({ subject, predicate }) => {
  //   return {
  //     id: predicate
  //   }
  // })

  // const reduced = queries.reduce((memo, { subject, predicate, reverse }) => {
  //   return { ...memo, [subject]: [ ...(memo[subject] || []), reverse ? `${predicate} @rev` : predicate ] }
  // }, {});

  // console.log(reduced);


  const query = `{
    ${queries.map((query, i) => `
      ${encodeQuery(query)}: ${query}
    `)}
  }`;

  console.log("Query:", query);
  const response = await cayley(query);

  const results = queries.map((query) => response[encodeQuery(query)]);
  console.log("Results:", results);

  return results;
});

export default loader;
