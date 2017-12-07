import * as fs from 'fs';
import * as path from 'path';
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLList,
  GraphQLString
} from 'graphql';
import SemanticGraph = require('semantic-graphql');
import { connectionArgs, connectionFromPromisedArray, globalIdField } from 'graphql-relay';
import { turtle } from 'feedbackfruits-knowledge-context';

import * as resolvers from './resolvers';
import loader from './cayley-loader';

const graph = new SemanticGraph(resolvers, { relay: false });
graph.parse(turtle);
graph['https://knowledge.express/entity'].shouldNeverUseInverseOf = true;
graph['https://knowledge.express/subjectOf'].shouldAlwaysUseInverseOf = true;
// graph['http://www.w3.org/2002/07/owl#sameAs'].shouldAlwaysUseInverseOf = true;

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      resource: {
        args: {
          id: { type: new GraphQLList(GraphQLString) }
        },
        type: new GraphQLList(graph.getObjectType('https://knowledge.express/Resource')),
        resolve: (source, args, context) => args.id.map(id => ({ id }))
      },

      entity: {
        args: {
          id: { type: new GraphQLList(GraphQLString) }
        },
        type: new GraphQLList(graph.getObjectType('https://knowledge.express/Entity')),
        resolve: (source, args, context) => args.id.map(id => ({ id }))
      },

      fieldOfStudy: {
        args: {
          id: { type: new GraphQLList(GraphQLString) }
        },
        type: new GraphQLList(graph.getObjectType('http://academic.microsoft.com/FieldOfStudy')),
        resolve: (source, args, context) => args.id.map(id => ({ id }))
      }
    }
  })
});

export default schema;
