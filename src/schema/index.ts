import {
  graphql,
  GraphQLSchema,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  FieldNode
} from 'graphql';

import { TopicType } from './topic';
import { build, BuilderObjectType } from './builder'

import { parseResults, toTopic, graph, unflatten } from '../graph';
import * as Context from '../graph/context';

export const Schema = new GraphQLSchema({
  query: new BuilderObjectType({
    name: 'RootQueryType',
    fields: {
      topic: {
        type: TopicType,
        args: {
          id: {
            type: GraphQLString,
          }
        },
        build(builder, { id }, path) {
          return graph.V(id).In(Context.name);
        },
        resolve(source, { name }, context, info) {
          let { operation: node, parentType: type } = info;
          let builder = build(node, <BuilderObjectType<any>>type, null, 'topic')
          return new Promise((resolve, reject) => {
            builder.All((err, res) => {
              console.log(`Build result:`, err, res);
              if (err) return reject(err);
              if (!res.result) reject(new Error('No results.'));
              return resolve(unflatten(res.result));
            });
          }).then((result: any) => {
            console.log('Unflatten result:', result);
            return result[0].topic;
          });
        }
      }
    }
  })
});

export default Schema;
