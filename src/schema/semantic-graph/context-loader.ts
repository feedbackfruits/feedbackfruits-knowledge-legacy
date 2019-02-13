import { Context } from 'feedbackfruits-knowledge-engine';
import { getRDFGraph, getClasses } from 'rdf-tools';

let _graph = null;
async function _getGraph() {
  return _graph = _graph || await getRDFGraph(Context.turtle);
}

let _classIris = null;
async function _getClasses() {
  return _classIris = _classIris || (await getClasses(Context.turtle)).classes.reduce((memo, c) => [ c.iri, ...c.subClasses, ...c.superClasses , ...memo ], []).reduce((memo, iri) => ({ ...memo, [iri]: true }),{});
}

export async function resolveSourcePropertyValue(source, iri): Promise<string | Array<string>> {
  const graph = await _getGraph();
  const objects = graph.match(source.id, iri, null).map(t => t.object);
  return objects.length === 1 ? objects[0] : objects.length ? objects : null;
}

export async function resolveSourceTypes(source): Promise<string[]> {
  if (source.id in await _getClasses()) {
    const graph = await _getGraph();
    const subjects = graph.match(null, "http://www.w3.org/2000/01/rdf-schema#subClassOf", source.id).map(t => t.subject);
    return subjects.length ? subjects : null;
  }

  return null;
}

export async function resolveResourcesByPredicate(types, iri, value): Promise<any> {
  return null;
};
