import * as CayleyLoader from './cayley-loader';
import * as ContextLoader from './context-loader';

export async function resolveSourceId(source) {
  console.log('resolveSourceId:', source);
  return source.id;
}

export async function resolveSourcePropertyValue(source, iri) {
  console.log('resolveSourcePropertyValue:', source ,iri);
  return await ContextLoader.resolveSourcePropertyValue(source, iri) || await CayleyLoader.resolveSourcePropertyValue(source, iri);
}

export async function resolveSourceTypes(source): Promise<string[]> {
  console.log('resolveSourceTypes:', source);

  // Make everything an instance of rdfs:Class to conform with the rdfs:Resource type attribute
  return ["http://www.w3.org/2000/01/rdf-schema#Class"].concat(await ContextLoader.resolveSourceTypes(source) || await CayleyLoader.resolveSourceTypes(source) || []);
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
  return await ContextLoader.resolveResourcesByPredicate(types, iri, value) || CayleyLoader.resolveResourcesByPredicate(types, iri, value);
};
