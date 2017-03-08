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
import { TopicReference, Topic } from '../topic';

export const TopicType: BuilderObjectType<any> = new BuilderObjectType<any>({
  name: 'TopicType',
  fields: () => ({
    id: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder.Tag(`${path}`);
      },
      resolve(source, args, context, info) {
        return source.id;
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
        return source.parents;
        // if ('id' in args && Object.keys(args).length == 1) return Promise.resolve(source.parents);
        // return Topic.getParents(source);
      }
    },
    children: {
      type: new GraphQLList(TopicType),
      build(builder, args, path) {
        return builder.Follow(Morphisms.children());
      },
      resolve(source, args, context, info) {
        return source.children;
        // if ('id' in args && Object.keys(args).length == 1) return Promise.resolve(source.children);
        // return Topic.getChildren(source);
      }
    }
  })
});

export default TopicType;
