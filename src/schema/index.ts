import {
  graphql,
  GraphQLSchema,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  FieldNode
} from 'graphql';

import { TopicType } from './topic';
import { build, BuilderObjectType } from '../builder'
import { GizmoBuilder } from '../builder/gizmo';

import unflatten from '../graph/unflatten';
import { graph } from '../builder/gizmo';
import * as Context from '../builder/context';

export const Schema = new GraphQLSchema({
  query: new BuilderObjectType<GizmoBuilder>({
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
          // return null;

          // let argsString = Object.keys(args).map(k => `${k}: ${JSON.stringify(args[k])}`).join(" ");
          // return `nodes(${argsString}) `;
        },
        resolve(source, { name }, context, info) {
          // let query = build(info.operation);
          // return get(query).then(res => data.nodes.topic);
          let { operation: node, parentType: type } = info;
          let builder = build(node, <BuilderObjectType<GizmoBuilder>>type, null, 'topic')
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
