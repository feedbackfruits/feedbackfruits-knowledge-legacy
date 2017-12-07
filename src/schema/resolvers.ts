import loader from './cayley-loader';
import { mapPredicate } from './hacks';

export async function simpleQuery(subject: string, iri: string): Promise<any> {
  const predicate = mapPredicate(iri);
  console.log('Simpe query:', subject, predicate);

  const query =  `
    nodes(id: "${subject}") {
      ${predicate.iri} @opt ${predicate.reverse ? ' @rev' : ''}
    }`;

  const result = await loader.load(query);
  return result[predicate.iri];
}

export async function reverseFilterQuery(types, iri, value) {
  const predicate = mapPredicate(iri);
  console.log('Reverse filter query:', types, predicate, value);
  // if (predicate === 'http://www.w3.org/2002/07/owl#sameAs') predicate = 'http://schema.org/sameAs';

  const query =  `
    nodes(${predicate.iri}: "${value}", http://www.w3.org/1999/02/22-rdf-syntax-ns#type: ${JSON.stringify(types)}) {
      id
    }`;

  const result = await loader.load(query);
  return result;
}

export async function resolveSourceId(source) {
  console.log('resolveSourceId:', source.id);
  return `${source.id}`;
}

export async function resolveSourcePropertyValue(source, iri) {
  console.log('resolveSourcePropertyValue:', source.id ,iri);
  return simpleQuery(`<${source.id}>`, iri)
}

export async function resolveSourceTypes(source) {
  console.log('resolveSourceTypes:', source.id);
  return simpleQuery(`<${source.id}>`, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
}

export async function resolveResource(id) {
  console.log('resolveResource:', id);
  return { id };
}

export async function resolveResources(ids) {
  console.log('resolveResources:', ids);
  return ids.map(id => ({ id }));
}

export async function resolveResourcesByPredicate(types, iri, value) {
  console.log('resolveResourcesByPredicate:', types, iri, value);
  return reverseFilterQuery(types.map(type => `<${type}>`), iri, `<${value}>`);
};
