import {
  graphql,
  GraphQLSchema,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { TopicType } from './topic';
import { ResourceType } from './resource';

import Topic from '../topic';

export const Schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      topic: {
        type: TopicType,
        args: {
          id: {
            type: GraphQLString,
          }
        },
        resolve(source, { id } , context, info) {
          console.log("PATH", JSON.stringify(<any>info.path));
          return Topic.get(id);
        }
      },
      resource: {
        type: ResourceType,
        args: {
          id: {
            type: GraphQLString
          }
        },
        resolve(source, { id }, context, info) {
          return {
            id: 'bla',
            type: 'bla',
            topics: [ { id: 'mathematics' } ]
          }
        }
      }
    }
  })
});

export default Schema;
