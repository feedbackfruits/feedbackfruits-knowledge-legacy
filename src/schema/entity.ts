import {
  GraphQLList,
  GraphQLString,
} from "graphql";

import { BuilderObjectType, buildNoop } from "../builder";
import * as Context from "../builder/context";
import { buildAttribute, buildRelationship, GraphQLBuilder } from "../builder/graphql";

import { FieldOfStudyType } from "./field_of_study";
import ResourceInterfaceType from "./resource";

const deirify = iri => iri.slice(1, iri.length - 1);

export const EntityType: BuilderObjectType<GraphQLBuilder> = new BuilderObjectType<GraphQLBuilder>({
  name: "Entity",
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
      build: buildNoop(),
      resolve(source, args, context, info) {
        return deirify(Context.Knowledge.Entity);
      }
    },
    name: {
      type: GraphQLString,
      build: buildAttribute("name", Context.GraphQL.NAME),
      resolve(source, args, context, info) {
        return source.name;
      }
    },
    description: {
      type: GraphQLString,
      build: buildAttribute("description", Context.GraphQL.DESCRIPTION),
      resolve(source, args, context, info) {
        return source.description;
      }
    },
    image: {
      type: GraphQLString,
      build: buildAttribute("image", Context.GraphQL.IMAGE),
      resolve(source, args, context, info) {
        return source.image;
      }
    },
    fieldsOfStudy: {
      type: new GraphQLList(FieldOfStudyType),
      build: buildRelationship("fieldsOfStudy", `${Context.sameAs} @rev`),
      resolve(source, args, context, info) {
        return source.fieldsOfStudy !== null ? [].concat(source.fieldsOfStudy) : [];
      }
    },
    resources: {
      type: new GraphQLList(ResourceInterfaceType),
      build: buildRelationship("resources", `${Context.about}`, {
        name: "rev",
        args: [],
      }, { [Context.type]: Context.Knowledge.Resource }),
      resolve(source, args, context, info) {
        return source.resources !== null ? [].concat(source.resources) : [];
      }
    }
  })
});

export default EntityType;
