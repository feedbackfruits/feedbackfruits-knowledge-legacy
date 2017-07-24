import * as fs from "fs";
import * as path from "path";
import SemanticGraph = require("semantic-graphql");

import * as resolvers from "./semantic-resolvers";

const ontologyDir = path.join(__dirname, "../node_modules/feedbackfruits-knowledge-context/ontology");
const ontologyFiles = fs.readdirSync(ontologyDir).filter(name => name.endsWith(".ttl")).map(name => path.join(ontologyDir, name));

const graph = new SemanticGraph(resolvers, { relay: true });

ontologyFiles.forEach(filePath =>  graph.parseFile(filePath));

// console.log(`graph created: ${graph}`);

// module.exports = graph;
// const fs = require('fs');
// const path = require('path');
import {
  GraphQLObjectType,
  GraphQLSchema
} from "graphql";
import { connectionArgs, connectionFromPromisedArray, globalIdField } from "graphql-relay";

// const { GraphQLSchema, GraphQLObjectType } = require('graphql');
// const ResourcesType = require('./customTypes/ResourcesType');
// const _ = require('./graph');

// const mutationFields = {};
// const mutationDir = path.join(__dirname, './mutations/');

// fs.readdirSync(mutationDir).forEach(fileName => {
//   mutationFields[fileName.split('.js')[0]] = require(mutationDir + fileName);
// });

const ResourcesType = new GraphQLObjectType({
  name: "Resources",
  interfaces: [graph.nodeInterface],
  fields: {
    id: globalIdField("Resources", () => "resources"),
    entities: {
      type: graph.getConnectionType("https://knowledge.express#Entity"),
      args: connectionArgs,
      resolve: (source, args) => connectionFromPromisedArray(Promise.resolve([{ bla: "test" }]), args),
    },
  },
});

export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      node: graph.nodeField,
      resources: {
        type: ResourcesType,
        resolve: () => ({}),
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
