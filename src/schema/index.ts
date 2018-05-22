import * as fs from 'fs';
import * as path from 'path';
import {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLList,
  GraphQLString
} from 'graphql-rxjs';
import SemanticGraph = require('semantic-graphql');
// import { connectionArgs, connectionFromPromisedArray, globalIdField } from 'graphql-relay';
import { getClasses } from 'rdf-tools';
import * as semtools from 'semantic-toolkit';
import { Doc, Context } from 'feedbackfruits-knowledge-engine';

import * as resolvers from './resolvers';
import * as Config from '../config';
import * as Cache from '../cache';
import Elasticsearch from '../elasticsearch';

import { Observable } from 'rxjs';

const graph = new SemanticGraph(resolvers, { relay: false });
graph.parse(Context.turtle);

graph['https://knowledge.express/tag'].shouldNeverUseInverseOf = true;
graph['https://knowledge.express/annotation'].shouldNeverUseInverseOf = true;

const lowerCaseFirst = (str: string): string => {
  return str[0].toLowerCase() + str.slice(1, str.length);
};

async function compactedToResult(compacted): Promise<object> {
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
            const result = cached ? (await compactedToResult(cached)) : { id };
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
        topic: {
          type: new GraphQLList(GraphQLString),
        }
      },
      type: new GraphQLList(graph.getInterfaceType(Context.iris.$.Resource)),
      resolve: async (source, args, context) => {
        const { topic: entities = [], page = 1, pageSize = 10 } = args;
        console.log('Searching for entities:', entities);
        const from = ((page || 0) - 1) * pageSize;
        const size = pageSize;

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
        const totalPages = Math.ceil(searchResults.meta.total / pageSize);

        const results = await Promise.all(searchResults.results.map(result => compactedToResult(result._source)));
        return results;
        // return [].concat(results[0]);

        // {
        //   meta: {
        //     page,
        //     pageSize,
        //     totalPages,
        //     totalResults: searchResults.meta.total
        //   },
        //   results: searchResults.results.map(result => ({
        //     score: result._score,
        //     ...result._source,
        //   }))
        // }
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
