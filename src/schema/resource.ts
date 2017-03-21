import {
  graphql,
  GraphQLSchema,
  GraphQLEnumType,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  GraphQLObjectTypeConfig,
  GraphQLField,
  GraphQLFieldMap,
  GraphQLFieldConfigMap,
  GraphQLFieldConfig,
  Thunk
} from 'graphql';

import { BuilderObjectType } from '../builder';
import { GraphQLBuilder } from '../builder/graphql';
import * as Context from '../builder/context';

import FieldOfStudyType from './field_of_study';

export const ResourceType: BuilderObjectType<GraphQLBuilder> = new BuilderObjectType<GraphQLBuilder>({
  name: 'ResourceType',
  fields: () => ({
    id: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder.find(Context.GraphQL.ID);
      },
      resolve(source, args, context, info) {
        return source.id;
      }
    },
    name: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder.find(Context.GraphQL.NAME);
      },
      resolve(source, args, context, info) {
        return source.name;
      }
    },
    description: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder.find(Context.GraphQL.DESCRIPTION);
      },
      resolve(source, args, context, info) {
        return source.description;
      }
    },
    image: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder.find(Context.GraphQL.IMAGE);
      },
      resolve(source, args, context, info) {
        return source.image;
      }
    },
    license: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder.find(Context.GraphQL.LICENSE);
      },
      resolve(source, args, context, info) {
        return source.license;
      }
    },
    fieldOfStudys: {
      type: new GraphQLList(FieldOfStudyType),
      build(builder, args, path) {
        let fieldOfStudys = new GraphQLBuilder(Context.about);

        builder.find({ fieldOfStudys });

        return fieldOfStudys;
      },
      resolve(source, args, context, info) {
        return source.fieldOfStudys !== null ? [].concat(source.fieldOfStudys) : [];
      }
    }
  })
});

export default ResourceType;
