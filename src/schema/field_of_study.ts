import {
  GraphQLList,
  GraphQLString,
} from "graphql";

import * as Context from "../builder/context";

import { BuilderObjectType } from "../builder";
import { buildAttribute, buildRelationship, GraphQLBuilder } from "../builder/graphql";

import { EntityType } from "./entity";

export const FieldOfStudyType: BuilderObjectType<GraphQLBuilder> = new BuilderObjectType<GraphQLBuilder>({
  name: "FieldOfStudy",
  builderType: "graphql",
  fields: () => ({
    id: {
      type: GraphQLString,
      build: buildAttribute("id", Context.GraphQL.ID),
      resolve(source, args, context, info) {
        return source.id;
      }
    },
    type: {
      type: GraphQLString,
      build: buildAttribute("type", Context.GraphQL.TYPE),
      resolve(source, args, context, info) {
        return source.type;
      }
    },
    name: {
      type: GraphQLString,
      build: buildAttribute("name", Context.GraphQL.NAME),
      resolve(source, args, context, info) {
        return source.name;
      }
    },
    entities: {
      type: new GraphQLList(EntityType),
      build: buildRelationship("entities", Context.sameAs),
      resolve(source, args, context, info) {
        return [].concat(source.entities);
      }
    },
    parents: {
      type: new GraphQLList(FieldOfStudyType),
      build: buildRelationship("parents", Context.AcademicGraph.parentFieldOfStudy),
      resolve(source, args, context, info) {
        return source.parents !== null ? [].concat(source.parents) : [];
      }
    },
    children: {
      type: new GraphQLList(FieldOfStudyType),
      build: buildRelationship("children", Context.AcademicGraph.childFieldOfStudy),
      resolve(source, args, context, info) {
        return source.children !== null ? [].concat(source.children) : [];
      }
    }
  })
});

export default FieldOfStudyType;
