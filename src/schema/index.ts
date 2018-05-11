import * as fs from 'fs';
import * as path from 'path';
import {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLList,
  GraphQLString
} from 'graphql';
import SemanticGraph = require('semantic-graphql');
import { connectionArgs, connectionFromPromisedArray, globalIdField } from 'graphql-relay';
import { turtle } from 'feedbackfruits-knowledge-context';
import { getClasses } from 'rdf-tools';
import * as semtools from 'semantic-toolkit';

import * as resolvers from './resolvers';

const graph = new SemanticGraph(resolvers, { relay: false });
graph.parse(turtle);

graph['https://knowledge.express/tag'].shouldNeverUseInverseOf = true;
graph['https://knowledge.express/annotation'].shouldNeverUseInverseOf = true;

const lowerCaseFirst = (str: string): string => {
  return str[0].toLowerCase() + str.slice(1, str.length);
};

export async function getSchema() {
  const { classes } = await getClasses(turtle);

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
        resolve: (source, args, context) => {
          return "id" in args ? args.id.reduce((memo, id) => {
            console.log()
            return [].concat({
              id,
              // page: args.page,
              // perPage: args.perPage
            }, memo);
          }, []) : null;
        }
      }
    };
  }, {});

  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: fields
    })
  });
}
