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

import { graph } from '../graph';
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
        build(args?: { [argName: string]: any }) {
          return graph.V('linguistics').In(Context.name);
        },
        resolve(source, { id }, context, info) {
          // debugger;
          // TopicType.getFields()['id'].build()
          //
          // const fields = info.operation.selectionSet.selections.map((s: FieldNode) => {
          //   return (<GraphQLObjectType>info.parentType).getFields()[s.name.value].type;
          // });
          // debugger;





          console.log("PATH", JSON.stringify(<any>info.path));

          return Topic.get(id);
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
