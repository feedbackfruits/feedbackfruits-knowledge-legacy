import {
  graphql,
  GraphQLSchema,
  GraphQLEnumType,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  GraphQLObjectTypeConfig
} from 'graphql';

import { TopicReference, Topic } from '../topic';

export const TopicReferenceType = new GraphQLObjectType(<GraphQLObjectTypeConfig<TopicReference, any>>{
  name: 'TopicReferenceType',
  fields: () => ({
    id: {
      type: GraphQLString,
      resolve(source, args, context, info) {
        return source.id;
      }
    }
  })
});

export const TopicType = new GraphQLObjectType(<GraphQLObjectTypeConfig<Topic, any>>{
  name: 'TopicType',
  fields: () => ({
    id: {
      type: GraphQLString,
      resolve(source, args, context, info) {
        return source.id;
      }
    },
    name: {
      type: GraphQLString,
      resolve(source, args, context, info) {
        return source.name;
      }
    },
    description: {
      type: GraphQLString,
      resolve(source, args, context, info) {
        return source.description;
      }
    },
    thumbnail: {
      type: GraphQLString,
      resolve(source, args, context, info) {
        return source.thumbnail;
      }
    },
    parents: {
      type: new GraphQLList(TopicType),
      resolve(source, args, context, info) {
        if ('id' in args && Object.keys(args).length == 1) return Promise.resolve(source.parents);
        return Topic.getParents(source);
      }
    },
    children: {
      type: new GraphQLList(TopicType),
      resolve(source, args, context, info) {
        if ('id' in args && Object.keys(args).length == 1) return Promise.resolve(source.children);
        return Topic.getChildren(source);      }
    }
  })
});

export default TopicType;
