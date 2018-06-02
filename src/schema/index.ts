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
import Elasticsearch from '../elasticsearch';

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
        type: new GraphQLList(graph.getObjectType(iri)),
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
        const from = ((page || 0) - 1) * perPage;
        const size = perPage;

        const query = {
          from,
          size,
          query: {
            bool: {
              must: [
                {
                  terms : {
                    sourceOrganization: Config.SEARCH_ORGANIZATIONS
                  }
                },
                {
                  has_child: {
                    type: "Tag",
                    score_mode : "sum",
                    query: {
                      terms: {
                        about: entities
                      }
                    }
                  }
                }
              ]
            }
          }
        };

        const searchResults = await Elasticsearch('resources', 'Resource', JSON.stringify(query), from, size)
        const totalPages = Math.ceil(searchResults.meta.total / perPage);

        return {
          meta: {
            page,
            perPage,
            totalPages,
            totalResults: searchResults.meta.total
          },
          results: searchResults.results.map(result => normalizeJSONLD(result._source))
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
