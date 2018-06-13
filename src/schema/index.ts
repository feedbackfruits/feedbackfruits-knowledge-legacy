import {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLList,
  GraphQLString
} from 'graphql-rxjs';
// import { connectionArgs, connectionFromPromisedArray, globalIdField } from 'graphql-relay';
import { getClasses } from 'rdf-tools';
import * as semtools from 'semantic-toolkit';
import { Doc, Context } from 'feedbackfruits-knowledge-engine';

import * as Cache from '../cache';
import * as Config from '../config';
import * as Search from '../search';

import { Observable } from 'rxjs';
import graph from './semantic-graph';

import SearchType from './search';

const lowerCaseFirst = (str: string): string => {
  return str[0].toLowerCase() + str.slice(1, str.length);
};

async function normalizeJSONLD(compacted): Promise<object> {
  const [ expanded ] = await Doc.expand(compacted, Context.context);
  const localized = Object.entries(expanded).reduce((memo, [key, value]) => {
    if (key[0] === '@') return { ...memo, [key]: value };
    const localName = semtools.getLocalName(key);
    return { ...memo, [localName]: value };
  }, {});

  const corrected = Object.entries(compacted).reduce((memo, [ key, value ]) => {
    if (key[0] === '@') return { ...memo, [key]: localized[key] };
    if (!(typeof value === 'object')) return { ...memo, [key]: value };
    if (!(value instanceof Array)) {
      throw new Error('Not implemented.');
    }
    return { ...memo, [key]: localized[key].map(doc => doc["@id"]) };
  }, {});

  const merged: object = {
    ...corrected,
    id: corrected["@id"],
    ...("@type" in corrected ? { type: [].concat(corrected["@type"]) } : {}),
  };

  delete merged["@id"];
  delete merged["@type"];

  return merged;
}

export async function getSchema() {
  const { classes } = await getClasses(Context.turtle);

  // Hacks to make sure all of the Object Types are available
  const objectTypes = classes.reduce((memo, c) => {
    const name = semtools.getLocalName(c.iri);
    const objectType = graph.getObjectType(c.iri);
    return {
      ...memo,
      [name]: {
        type: objectType,
        resolve() { return null; }
      }
    };
  }, {})

  // Expose class as a type so things rdfs:Class is queryable
  const fields = ["http://www.w3.org/2000/01/rdf-schema#Class"].concat(classes.map(c => c.iri)).reduce((memo, iri) => {
    const name = semtools.getLocalName(iri);
    return {
      ...memo,
      [lowerCaseFirst(name)]: {
        args: {
          id: { type: new GraphQLList(GraphQLString) },
          // page: { type: GraphQLInt, defaultValue: 1 },
          // perPage: { type: GraphQLInt, defaultValue: 10 },
        },
        type: new GraphQLList(graph.getInterfaceType(iri)),
        resolve: async (source, args, context) => {
          console.log(`Resolving top-level ${name}`);
          const { id  } = args;
          if  (!("id" in args)) return null;

          const cached = await Promise.all(args.id.map(async (id) => {
            // const cached = null;
            const cached = await Cache.getDoc(id);
            console.log('Cached result:', cached);
            const result = cached ? (await normalizeJSONLD(cached)) : { id };
            console.log('Returning result:', result);
            return result;
          }));

          console.log(`Returning cached:`, cached);

          return cached;
        }
      }
    };
  }, {
    types: {
      type: new GraphQLObjectType({
        name: 'ObjectTypes',
        fields: objectTypes
      }),
      resolve() {
        return null;
      }
    },
    search: {
      args: {
        about: {
          type: new GraphQLList(GraphQLString),
        },
        page: {
          type: GraphQLInt
        },
        perPage: {
          type: GraphQLInt
        }
      },
      type: SearchType,
      resolve: async (source, args, context) => {
        const { about: entities = [], page = 1, perPage = 10 } = args;
        const { meta, results } = await Search.search(entities, page, perPage);
        const mapped = await Promise.all(results.map(result => normalizeJSONLD(result)));
        console.log('Done searching:', mapped);
        return {
          meta,
          results: mapped
        }
      }
    }
  });

  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: fields
    })
  });
}
