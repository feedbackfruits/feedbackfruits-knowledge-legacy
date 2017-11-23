import loader from './cayley-loader';

export async function simpleQuery(subject, predicate) {
  const query =  `
    nodes(id: "${subject}") {
      ${predicate} @opt
    }`;

  const result = await loader.load(query);
  return result[predicate];
}

export async function reverseFilterQuery(types, predicate, value) {
  const query =  `
    nodes(${predicate}: "${value}", http://www.w3.org/1999/02/22-rdf-syntax-ns#type: ${JSON.stringify(types)}) {
      id
    }`;

  const result = await loader.load(query);
  return result;
}

export async function resolveSourceId(source) {
  return `${source.id}`;
}

export async function resolveSourcePropertyValue(source, iri) {
  return simpleQuery(`<${source.id}>`, iri)
}

export async function resolveSourceTypes(source) {
  return simpleQuery(`<${source.id}>`, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
}

export async function resolveResource(id) {
  return { id };
}

export async function resolveResources(ids) {
  return ids.map(id => ({ id }));
}

export async function resolveResourcesByPredicate(types, iri, value) {
  return reverseFilterQuery(types.map(type => `<${type}>`), iri, `<${value}>`);
};
