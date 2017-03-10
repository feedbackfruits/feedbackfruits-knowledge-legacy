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

import { BuilderObjectType } from './builder';

import { Morphisms } from '../graph';
import * as Context from '../graph/context';

export const TopicType: BuilderObjectType<any> = new BuilderObjectType<any>({
  name: 'TopicType',
  fields: () => ({
    id: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder.Tag(`${path}`);
      },
      resolve(source, args, context, info) {
        return source.name;
      }
    },
    name: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder.Save(Context.name, `${path}`);
      },
      resolve(source, args, context, info) {
        return source.name;
      }
    },
    description: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder.Save(Context.description, `${path}`);
      },
      resolve(source, args, context, info) {
        return source.description;
      }
    },
    thumbnail: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder.Save(Context.image, `${path}`);
      },
      resolve(source, args, context, info) {
        return source.thumbnail;
      }
    },
    parents: {
      type: new GraphQLList(TopicType),
      build(builder, args, path) {
        return builder.Follow(Morphisms.parents());
      },
      resolve(source, args, context, info) {
        return [].concat(source.parents);
      }
    },
    children: {
      type: new GraphQLList(TopicType),
      build(builder, args, path) {
        return builder.Follow(Morphisms.children());
      },
      resolve(source, args, context, info) {
        return [].concat(source.children);
      }
    }
  })
});

export default TopicType;
