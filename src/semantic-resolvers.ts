import toolkit = require("semantic-toolkit");

import loader from './semantic-loader';

const { getLocalName } = toolkit;

// const sortCreatedAt = (a, b) => a.createdAt > b.createdAt ? 1 : -1;

const log = console.log.bind(console);

function resolveSourceId(source) {
  log(`Called: resolveSourceId with:`, source);
  return `${source.id}`;
}

function resolveSourcePropertyValue(source, iri) {
  log(`Called: resolveSourcePropertyValue with:`, source, iri);
  return loader.load({ subject: `<${source.id}>`, predicate: iri });
}

function resolveSourceTypes(source) {
  log(`Called: resolveSourceTypes with:`, source);
  return loader.load({ subject: `<${source.id}>`, predicate: 'type' });;
}

function resolveResource(id) {
  log(`Called: resolveResource with:`, id);
  return { id };
}

function resolveResources(ids) {
  log(`Called: resolveResources with:`, ids);
  return ids.map(id => ({ id }));
}

function resolveResourcesByPredicate(types, iri, value) {
  log(`Called resolveResourcesByPredicate with:`, types, iri, value);
  return { };
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
