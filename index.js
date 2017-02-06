require('dotenv').load({ silent: true });

const fetch = require('node-fetch');

const MAG_API_KEY = process.env.MAG_API_KEY;
const MAG_API_ENDPOINT = 'https://westus.api.cognitive.microsoft.com/academic/v1.0/evaluate';
const BETTER_ENDPOINT = 'https://academic.microsoft.com/api/browse/GetEntityDetails';

const FID = 'FId';
const ID = 'Id';
const NAME = 'FN';
const PARENT = 'FP';
const CHILD = 'FC';

const log = console.log.bind(console);

function evaluate(expression, attributes) {
  const count = 1000;
  const offset = 0;
  const url = `${MAG_API_ENDPOINT}?expr=${expression}&model=latest&count=${count}&offset=${offset}&attributes=${attributes.join(',')}`;
  const headers = {
    'Ocp-Apim-Subscription-Key': MAG_API_KEY
  };

  return fetch(url, { headers }).then(response => response.json());
}

function wikize(name) {
  return name[0].toUpperCase() + name.slice(1).replace(/ /g, '_');
}

function params(object) {
  return Object.keys(object).reduce((memo, key) => {
    const value = JSON.stringify(object[key]).replace(/"/g, "'");
    return (memo ? memo + ',' : '') + `${key}=${value}`
  }, null);
}

function composite(query) {
  return `Composite(${query})`;
}

function and(...args) {
  return `And(${args.join(',')})`;
}

function get(id, attributes) {
  const expression = params({ [ID]: id })
  return evaluate(expression, attributes).then(({ entities: [entity] }) => entity);
}

function out(id, edge, attributes) {
  return get(id, attributes.map(attr => `${edge}.${attr}`)).then(entity => entity[edge]);
}

function entitize(entity) {
  const url = `${BETTER_ENDPOINT}?entityId=${entity[ID]}&correlationId=1`;
  const headers = {
    'Accept': 'application/ld+json'
  };

  return fetch(url, { headers }).then(response => response.json());
}

const id = 23224414;
const attributes = [ID, NAME];

get(id, attributes).then(entitize).then(log);

// get(id, attributes).then(log);

// function getParents() {
//   const attributes = ['Id','DFN','FN'];
//   const expression = and(
//     composite(params({ 'FP.FN': 'machine learning' })),
//     composite(params({ 'FP.FN': 'speech recognition' }))
//   );
//
//   return evaluate(expression, attributes);
// }

// const url = `https://westus.api.cognitive.microsoft.com/academic/v1.0/evaluate?expr=Id=19165224&attributes=`;
// const attributes = ['FN','FId'];

// evaluate(expression, attributes).then(log);
// getParents().then(log);
