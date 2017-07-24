import toolkit = require("semantic-toolkit");

const { getLocalName } = toolkit;

// const sortCreatedAt = (a, b) => a.createdAt > b.createdAt ? 1 : -1;

const log = console.log.bind(console);

function resolveSourceId(source) {
  log(`Called: resolveSourceId with:`, arguments);
  return source.id;
}

function resolveSourcePropertyValue(source, iri) {
  log(`Called: resolveSourcePropertyValue with:`, arguments);
  return source[getLocalName(iri)];
}

function resolveSourceTypes(source) {
  log(`Called: resolveSourceTypes with:`, arguments);
  return source.type;
}

function resolveResource(id) {
  log(`Called: resolveResource with:`, arguments);
  return { };
  // return db.readResourceById(id);
}

function resolveResources(ids) {
  log(`Called: resolveResources with:`, arguments);
  return { };
  // return db.readResourcesById(ids);
}

function resolveResourcesByPredicate(types, iri, value) {
  log(`Called resolveResourcesByPredicate with:`, arguments);
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
