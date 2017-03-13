import {
  graphql,
  GraphQLSchema,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  FieldNode
} from 'graphql';

import { TopicType } from './topic';
import { build, BuilderObjectType } from '../builder';
import { GraphQLBuilder } from '../builder/graphql';

import * as Context from '../builder/context';

import cayley from '../cayley';

export const Schema = new GraphQLSchema({
  query: new BuilderObjectType<GraphQLBuilder>({
    name: 'RootQueryType',
    fields: {
      topic: {
        type: TopicType,
        args: {
          id: {
            type: GraphQLString,
          },
          name: {
            type: GraphQLString
          }
        },

        build(builder, { id, name }, path) {
          let topic = new GraphQLBuilder(`${Context.name} @rev`);

          if (id) builder.filter({ id });
          if (name) builder.filter({ id: name });

          builder.find({ topic });

          return topic;
        },
        resolve(source, { }, context, info) {
          let { operation: node, parentType: type } = info;
          let base = new GraphQLBuilder('nodes',);
          let builder = build(node, <BuilderObjectType<GraphQLBuilder>>type, base);
          let query = builder.toString();
          return cayley(query).then((res: any) => res.nodes.topic);
        }
      }
    }
  })
});

export default Schema;
