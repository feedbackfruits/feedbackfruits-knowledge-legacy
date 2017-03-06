import {
  graphql,
  GraphQLSchema,
  GraphQLEnumType,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  GraphQLObjectTypeConfig
} from 'graphql';

import { TopicType } from './topic';
import { TopicReference, Topic } from '../topic';

export type Resource = {
  id: string,
  type: string,
  provider: string,
  source: string,
  name: string,
  description: string,
  topics: Array<TopicReference | Topic>
}

export const ResourceType = new GraphQLObjectType(<GraphQLObjectTypeConfig<Resource, any>>{
  name: 'ResourceType',
  fields: () => ({
    id: {
      type: GraphQLString,
      resolve(source, args, context, info) {
        return source.id;
      }
    },
    type: {
      type: GraphQLString,
      resolve(source, args, context, info) {
        return source.type;
      }
    },
    topics: {
      type: new GraphQLList(TopicType),
      resolve(source, args, context, info) {
        return source.topics;
        // if ('id' in args && Object.keys(args).length == 1) return Promise.resolve(source.parents);
        // return Resource.getParents(source);
      }
    }
  })
});

export default ResourceType;
