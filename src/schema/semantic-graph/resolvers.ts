import semtools from 'semantic-toolkit';
import { Context, Helpers as _Helpers } from 'feedbackfruits-knowledge-engine';

import * as CayleyLoader from './cayley-loader';
import * as ContextLoader from './context-loader';
import * as DBPediaLoader from './dbpedia-loader';
import * as NeptuneLoader from './neptune-loader';

import * as Cache from '../../cache';
import * as Config from '../../config';
import { normalizeJSONLD } from '..';

const loaders = {
  Cayley: CayleyLoader,
  Context: ContextLoader,
  DBPedia: DBPediaLoader,
  Neptune: NeptuneLoader,
}

const loadersEnabled = {
  // Cayley: true,
  Context: false,
  DBPedia: false,
  Neptune: true,
};

export async function resolveSourceId(source) {
  // console.log('resolveSourceId:', source);
  return source.id;
}

export async function resolveResource(id) {
  // console.log('resolveResource:', id);

  // FIXME: This is a hacky workaround to make use of the search result properties
  if (typeof id === 'object') return id;

  if (!Config.CACHE_ENABLED) return { id };
  const cached = await Cache.getDoc(id)
  return cached ? await normalizeJSONLD(cached) : { id };
}

export async function resolveResources(ids) {
  // console.log('resolveResources:', ids);
  return ids.map(id => ({ id }));
}

const skippableIris = {
  [Context.iris.schema.name]: true,
  [Context.iris.schema.description]: true,
  [Context.iris.schema.image]: true,
  // [Context.iris.$.topic]: true,
}
export async function resolveSourcePropertyValue(source, iri) {
  // console.log('resolveSourcePropertyValue:', source, iri);

  // Check source first
  const localName = semtools.getLocalName(iri);
  // console.log(`localName ${localName} in source && null?:`, localName in source && source[localName] == null);
  // console.log(source[localName]);

  const keys = Object.keys(source);
  if (localName in source) return source[localName];
  else if (keys.length > 1) {
    if (iri in skippableIris && skippableIris[iri]) return null;
  }



  // if (iri === Context.iris.$.tag) {
  //   const waitingPromise = new Promise((resolve, reject) => {
  //     setTimeout(() => resolve(), 5000);
  //   });
  //   await waitingPromise;
  // }

  if (Config.CACHE_ENABLED) {
    // Check Cache second
    const cached = await Cache.getQuads({ subject: source.id, predicate: iri });
    if (cached.length > 0) {
      // console.log('Cached:', cached);
      return cached.map(({ object }) => object);
    }
  }

  const res = (await Promise.all(Object.keys(loadersEnabled).map(key => {
    if (loadersEnabled[key]) return loaders[key].resolveSourcePropertyValue(source, iri);
    return null;
  }))).reduce((memo, result) => {
    if (memo == null && result == null) return null;
    if (memo == null && result != null) return result;
    if (memo != null && result == null) return memo;
    if (memo != null && result != null) return [].concat(memo, result);
  }, undefined);

  // Store result in Cache
  if (res != null) {
    const quads = [].concat(res).map(object => ({
      subject: source.id,
      predicate: iri,
      object: object
    }));

    if (Config.CACHE_ENABLED) {
      await Cache.setQuads(quads);
    }
  }

  // console.log('resolveSourcePropertyValue result:', iri, res);
  return res;
}

export async function resolveSourceTypes(source): Promise<string[]> {
  // console.log('resolveSourceTypes:', source);

  // Make everything an instance of rdfs:Class to conform with the rdfs:Resource type attribute
  let res = ["http://www.w3.org/2000/01/rdf-schema#Class"];

  // Check source first
  if ('type' in source) return [].concat(res, source.type);
  if ('@type' in source) return [].concat(res, source["@type"]);
  if (Context.iris.rdf.type in source) return [].concat(res, source[Context.iris.rdf.type]);

  const contextResult = await ContextLoader.resolveSourceTypes(source);
  // console.log('Context result for: ', source.id, contextResult);
  if (contextResult != null) {
    return contextResult;
  }

  let cached = [];
  if (Config.CACHE_ENABLED) {
    // Check Cache second
    cached = await Cache.getQuads({ subject: source.id, predicate: Context.iris.rdf.type });
  }
  if (cached.length > 0) res = [].concat(res, cached.map(({ object }) => object));
  else {
    res = [].concat(res, (await Promise.all(Object.keys(loadersEnabled).map(key => {
      if (loadersEnabled[key]) return loaders[key].resolveSourceTypes(source);
      return null;
    }))).reduce((memo, result) => {
      if (memo == null && result == null) return null;
      if (memo == null && !(result == null)) return result;
      if (memo != null && result == null) return memo;
      if (memo != null && result != null) return [].concat(memo, result);
    }, undefined) || []);
  }

  // Store result in Cache
  if (res != null) {
    const quads = [].concat(res).map(object => ({
      subject: source.id,
      predicate: Context.iris.rdf.type,
      object
    }));

    if (Config.CACHE_ENABLED) {
      await Cache.setQuads(quads);
    }
  }

  // Apply hacks
  const types = res.reduce((memo, type) => ({ ...memo, [type]: true }), {});
  if (Context.iris.$.Resource in types && Context.iris.schema.VideoObject in types) {
    res = [].concat(res, Context.iris.$.Video);
  }

  // console.log('resolveSourceTypes result:', res);
  return res;
}

export async function resolveResourcesByPredicate(types, iri, value) {
  // console.log('resolveResourcesByPredicate:', types, iri, value);

  const res = (await Promise.all(Object.keys(loadersEnabled).map(key => {
    if (loadersEnabled[key]) return loaders[key].resolveResourcesByPredicate(types, iri, value);
    return null;
  }))).reduce((memo, result) => {
    if (memo == null && result == null) return null;
    if (memo == null && !(result == null)) return result;
    if (memo != null && result == null) return memo;
    if (memo != null && result != null) return [].concat(memo, result);
  }, undefined);

  // console.log('resolveResourcesByPredicate result:', res);
  return res;
};
