import * as DataLoader from 'dataloader';

import cayley from "./cayley";

const loader = new DataLoader<{ subject: string, predicate: string }, any>(async keys => {
  console.log('I am a loader!', keys);
  // return keys.map(({ subject, predicate }) => {
  //   return {
  //     id: predicate
  //   }
  // })

  const reduced = keys.reduce((memo, { subject, predicate }) => {
    return { ...memo, [subject]: [ ...(memo[subject] || []), predicate ] }
  }, {});

  console.log(reduced);

  const query = `{
    ${Object.keys(reduced).map(subject => `
      ${subject}: nodes(id: "${subject}") { ${reduced[subject].map(predicate => `${predicate} @opt`).join(' ')} }
    `)}
  }`;

  console.log("Query:", query);
  const response = await cayley(query);

  const results = keys.map(({ subject, predicate }) => response[subject][predicate]);  
  console.log("Results:", results);

  return results;
});

export default loader;
