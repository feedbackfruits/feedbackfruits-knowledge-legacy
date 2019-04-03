import { Context } from 'feedbackfruits-knowledge-engine';
import { getRDFGraph, getClasses } from 'rdf-tools';

let _graph = null;
async function _getGraph() {
  if (_graph == null) _graph  = await getRDFGraph(Context.turtle);
  return _graph;
}

let _classIris = null;
async function _getClasses() {
  if (_classIris == null) _classIris = (await getClasses(Context.turtle)).classes.reduce((memo, c) => [ c.iri, ...c.subClasses, ...c.superClasses , ...memo ], []).reduce((memo, iri) => ({ ...memo, [iri]: true }),{});
  return _classIris;
}

export async function resolveSourcePropertyValue(source, iri): Promise<string | Array<string>> {
  const graph = await _getGraph();
  const objects = graph.match(source.id, iri, null).map(t => t.object);
  return objects.length === 1 ? objects[0] : objects.length ? objects : null;
}

const mediaRegex = /https:\/\/staging-media\.feedbackfruits\.com\/.*/;
const mediaImageRegex = /https:\/\/staging-media\.feedbackfruits\.com\/.*\/preview.png\?width=400&height=200&strategy=fit/;
const sourceOrganizations = {
  "https://ocw.mit.edu": true,
};
const entityRegex = /http:\/\/dbpedia\.org\/resource\/.+/;
const tagRegex = /https:\/\/knowledge\.express\/tag#.+/;
const mitTopicRegex = /https:\/\/ocw\.mit\.edu\/courses\/(.+?\/?)+/;

export async function resolveSourceTypes(source): Promise<string[]> {
  // if (source.id in await _getClasses()) {
  //   const graph = await _getGraph();
  //   const subjects = graph.match(null, "http://www.w3.org/2000/01/rdf-schema#subClassOf", source.id).map(t => t.subject);
  //   return subjects.length ? subjects : null;
  // }
  if (source.id == null || !(typeof source.id === 'string')) return null;

  if (source.id in await _getClasses()) {
    return [ "http://www.w3.org/2000/01/rdf-schema#Class" ];
  }

  if (source.id in sourceOrganizations) {
    return [ Context.iris.schema.Organization ];
  }

  if (source.id.match(tagRegex)) {
    const [ , hash ] = source.id.split("#");
    const decoded = new Buffer(hash, 'base64').toString();
    const [ , tail ] = decoded.split(/-(http.*)/);
    const details = tail.split('-');
    if (details.length === 1) return [ Context.iris.$.Tag ];
    return null;
    // return [ Context.iris.$.DocumentAnnotation ];
  }

  if (source.id.match(entityRegex)) {
    return [ Context.iris.$.Entity ];
  }

  if (source.id.match(mediaRegex)) {
    if (source.id.match(mediaImageRegex)) return [ Context.iris.schema.ImageObject ];
    return [ Context.iris.schema.MediaObject];
  }

  if (source.id.match(mitTopicRegex) && source.id.slice(-4) !== ".pdf") {
    return [ Context.iris.$.Topic ];
  }

  return null;
}

export async function resolveResourcesByPredicate(types, iri, value): Promise<any> {
  return null;
};

// Preload graph and classes
_getClasses();
