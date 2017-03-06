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

import * as Context from '../graph/context';
import { TopicReference, Topic } from '../topic';

export const TopicType: BuilderObjectType<any> = new BuilderObjectType<any>({
  name: 'TopicType',
  fields: () => ({
    id: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder.Tag(`${path}.id`);
      },
      resolve(source, args, context, info) {
        return source.id;
      }
    },
    name: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder.Save(Context.name, `${path}.name`);
      },
      resolve(source, args, context, info) {
        console.log("PATH", JSON.stringify(<any>info.path));
        return source.name;
      }
    },
    description: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder.Save(Context.description, `${path}.description`);
      },
      resolve(source, args, context, info) {
        console.log("PATH", JSON.stringify(<any>info.path));
        return source.description;
      }
    },
    thumbnail: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder.Save(Context.image, `${path}.thumbnail`);
      },
      resolve(source, args, context, info) {
        console.log("PATH", JSON.stringify(<any>info.path));
        return source.thumbnail;
      }
    },
    // parents: {
    //   type: new GraphQLList(TopicType),
    //   resolve(source, args, context, info) {
    //     console.log("PATH", JSON.stringify(<any>info.path));
    //     if ('id' in args && Object.keys(args).length == 1) return Promise.resolve(source.parents);
    //     return Topic.getParents(source);
    //   }
    // },
    // children: {
    //   type: new GraphQLList(TopicType),
    //   resolve(source, args, context, info) {
    //     console.log("PATH", JSON.stringify(<any>info.path));
    //     if ('id' in args && Object.keys(args).length == 1) return Promise.resolve(source.children);
    //     return Topic.getChildren(source);
    //   }
    // }
  })
});

export default TopicType;
