import * as fs from "fs";
import * as path from "path";
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLList
} from "graphql";
import { connectionArgs, connectionFromPromisedArray, globalIdField } from "graphql-relay";
import SemanticGraph = require("semantic-graphql");

import * as resolvers from "./semantic-resolvers";
import loader from './semantic-loader';

const ontologyDir = path.join(__dirname, "../node_modules/feedbackfruits-knowledge-context/ontology");
const ontologyFiles = fs.readdirSync(ontologyDir).filter(name => name.endsWith(".ttl")).map(name => path.join(ontologyDir, name));

const graph = new SemanticGraph(resolvers, { relay: false });

ontologyFiles.forEach(filePath =>  graph.parseFile(filePath));

graph['http://schema.org/subjectOf'].shouldAlwaysUseInverseOf = true;
// console.log(`graph created: ${graph}`);

// module.exports = graph;
// const fs = require('fs');
// const path = require('path');


// const { GraphQLSchema, GraphQLObjectType } = require('graphql');
// const ResourcesType = require('./customTypes/ResourcesType');
// const _ = require('./graph');

// const mutationFields = {};
// const mutationDir = path.join(__dirname, './mutations/');

// fs.readdirSync(mutationDir).forEach(fileName => {
//   mutationFields[fileName.split('.js')[0]] = require(mutationDir + fileName);
// });

// const ResourcesType = new GraphQLObjectType({
//   name: "Resources",
//   interfaces: [graph.nodeInterface],
//   fields: {
//     id: globalIdField("Resources", () => "resources"),
//     entities: {
//       type: graph.getConnectionType("https://knowledge.express#Entity"),
//       args: connectionArgs,
//       resolve: (source, args) => connectionFromPromisedArray(Promise.resolve([{ bla: "test" }]), args),
//     },
//   },
// });

export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      // node: graph.nodeField,
      resource: {
        type: new GraphQLList(graph.getObjectType("https://knowledge.express/Resource")),
        resolve: (source, args, context) => new Array(1).fill({ id: 'https://www.youtube.com/watch?v=SQzjzStU1RQ' }),
      },

      entity: {
        type: new GraphQLList(graph.getObjectType("https://knowledge.express/Entity")),
        resolve: (source, args, context) => new Array(1).fill({ id: 'http://dbpedia.org/resource/Mathematics' }),
      },

      // viewer: {
      //   type: graph.getObjectType("https://knowledge.express#Resource"),
      //   resolve: (source, args, { viewer }) => viewer,
      // },
    },
  }),
  // mutation: new GraphQLObjectType({
  //   name: 'Mutation',
  //   fields: mutationFields,
  // }),
});
