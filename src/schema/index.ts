import {
  graphql,
  GraphQLSchema,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  FieldNode
} from 'graphql';

import { TopicType } from './topic';
import { ResourceType } from './resource';
import { build, BuilderObjectType } from './builder'

import { parseResults, toTopic, graph, unflatten } from '../graph';
import * as Context from '../graph/context';

import Topic from '../topic';

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
          // debugger;
          // TopicType.getFields()['id'].build()
          //
          // debugger;
          // info.fieldNodes.map(node => {
          //   node.selectionSet.selections.reduce((s) => {
          //
          //   });

            // const fields = info.operation.selectionSet.selections.map((s: FieldNode) => {
            //   return (<GraphQLObjectType>info.parentType).getFields()[s.name.value].type;
            // });

          //   fields.reduce(() => {
          //
          //   }, )
          //   build(node, )
          // })

          let { operation: node, parentType: type } = info;
          // let { operation } = info;
          // let node = <FieldNode>operation.selectionSet.selections.find((n: FieldNode) => n.name.value === 'topic');
          // let type = TopicType;
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


          // console.log("PATH", JSON.stringify(<any>info.path));

          // return Topic.get(id);
        }
      },
      // resource: {
      //   type: ResourceType,
      //   args: {
      //     id: {
      //       type: GraphQLString
      //     }
      //   },
      //   resolve(source, { id }, context, info) {
      //     return {
      //       id: 'bla',
      //       type: 'bla',
      //       topics: [ { id: 'mathematics' } ]
      //     }
      //   }
      // }
    }
  })
});

export default Schema;
