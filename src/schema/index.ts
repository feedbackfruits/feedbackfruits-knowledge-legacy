import {
  graphql,
  GraphQLSchema,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import Topic from '../topic';
import { TopicType } from './topic';
import { DBPEDIA_ENDPOINT } from '../config';
import { get as getEntity } from '../dbpedia';

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
          return Topic.get(id);
          // const url = `${DBPEDIA_ENDPOINT}${id}`;
          // return getEntity(url).then(entity => Object.assign({}, entity, { id: entity.name }));
        }
      }
    }
  })
});

export default Schema;
