import * as CayleyLoader from './cayley-loader';
import * as ContextLoader from './context-loader';
import * as DBPediaLoader from './dbpedia-loader';

const loaders = {
  Cayley: CayleyLoader,
  Context: ContextLoader,
  DBPedia: DBPediaLoader,
}

const loadersEnabled = {
  Cayley: true,
  Context: true,
  DBPedia: true,
};

export async function resolveSourceId(source) {
  console.log('resolveSourceId:', source);
  return source.id;
}

export async function resolveResource(id) {
  console.log('resolveResource:', id);
  return { id };
}

export async function resolveResources(ids) {
  console.log('resolveResources:', ids);
  return ids.map(id => ({ id }));
}

export async function resolveSourcePropertyValue(source, iri) {
  console.log('resolveSourcePropertyValue:', source ,iri);

  const res = (await Promise.all(Object.keys(loadersEnabled).map(key => {
    if (loadersEnabled[key]) return loaders[key].resolveSourcePropertyValue(source, iri);
    return null;
  }))).reduce((memo, result) => {
    if (memo == null && result == null) return null;
    if (memo == null && result != null) return result;
    if (memo != null && result == null) return memo;
    if (memo != null && result != null) return [].concat(memo, result);
  }, undefined);

  console.log('resolveSourcePropertyValue result:', res);
  return res;
}

export async function resolveSourceTypes(source): Promise<string[]> {
  console.log('resolveSourceTypes:', source);

  // Make everything an instance of rdfs:Class to conform with the rdfs:Resource type attribute
  const res = ["http://www.w3.org/2000/01/rdf-schema#Class"].concat((await Promise.all(Object.keys(loadersEnabled).map(key => {
    if (loadersEnabled[key]) return loaders[key].resolveSourceTypes(source);
    return null;
  }))).reduce((memo, result) => {
    if (memo == null && result == null) return null;
    if (memo == null && !(result == null)) return result;
    if (memo != null && result == null) return memo;
    if (memo != null && result != null) return [].concat(memo, result);
  }, undefined) || []);

  console.log('resolveSourceTypes result:', res);
  return res;
}

export async function resolveResourcesByPredicate(types, iri, value) {
  console.log('resolveResourcesByPredicate:', types, iri, value);

  const res = (await Promise.all(Object.keys(loadersEnabled).map(key => {
    if (loadersEnabled[key]) return loaders[key].resolveResourcesByPredicate(types, iri, value);
    return null;
  }))).reduce((memo, result) => {
    if (memo == null && result == null) return null;
    if (memo == null && !(result == null)) return result;
    if (memo != null && result == null) return memo;
    if (memo != null && result != null) return [].concat(memo, result);
  }, undefined);

  console.log('resolveResourcesByPredicate result:', res);
  return res;
};
