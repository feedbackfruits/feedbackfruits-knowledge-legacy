import toolkit = require("semantic-toolkit");

import loader from './semantic-loader';

const { getLocalName } = toolkit;

// const sortCreatedAt = (a, b) => a.createdAt > b.createdAt ? 1 : -1;

const log = console.log.bind(console);

async function simpleQuery(subject, predicate) {
  const query =  `
    nodes(id: "${subject}") {
      ${predicate} @opt
    }`;

  const result = await loader.load(query);
  return result[predicate];
}

async function reverseFilterQuery(types, predicate, value) {
  const query =  `
    nodes(${predicate}: "${value}", http://www.w3.org/1999/02/22-rdf-syntax-ns#type: ${JSON.stringify(types)}) {
      id
    }`;

  const result = await loader.load(query);
  return result;
}


async function resolveSourceId(source) {
  log(`Called: resolveSourceId with:`, source);
  return `${source.id}`;
}

async function resolveSourcePropertyValue(source, iri) {
  log(`Called: resolveSourcePropertyValue with:`, source, iri);
  return simpleQuery(`<${source.id}>`, iri)

  // console.log(`Returning property value for ${iri}:`, result);
  //
  // return result;
}

async function resolveSourceTypes(source) {
  log(`Called: resolveSourceTypes with:`, source);
  return simpleQuery(`<${source.id}>`, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
  // const result = await loader.load(query);

  // return result;
}

async function resolveResource(id) {
  log(`Called: resolveResource with:`, id);
  return { id };
}

async function resolveResources(ids) {
  log(`Called: resolveResources with:`, ids);
  return ids.map(id => ({ id }));
}

async function resolveResourcesByPredicate(types, iri, value) {
  log(`Called resolveResourcesByPredicate with:`, types, iri, value);

  return reverseFilterQuery(types.map(type => `<${type}>`), iri, `<${value}>`);
  // console.log('Reverse query:', query);
  // return await loader.load(query);

  // return result;
  // const localName = getLocalName(iri);
  // const queries = types.map(type => run(db.createQuery(type).filter(localName, value)));

  // log('resolvePredicate', types.map(getLocalName), localName, value);
  // return Promise.all<any[]>(queries).then(payloads => payloads.reduce((a, b) => a.concat(b), []).sort(sortCreatedAt));
}

export {
  resolveSourceId,
  resolveSourcePropertyValue,
  resolveSourceTypes,
  resolveResource,
  resolveResources,
  resolveResourcesByPredicate,
};
