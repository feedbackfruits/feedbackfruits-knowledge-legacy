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

import { BuilderObjectType } from '../builder';
import { GraphQLBuilder } from '../builder/graphql';
import * as Context from '../builder/context';

import ResourceType from './resource';

export const TopicType: BuilderObjectType<GraphQLBuilder> = new BuilderObjectType<GraphQLBuilder>({
  name: 'TopicType',
  builderType: 'graphql',
  fields: () => ({
    id: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder.find(Context.GraphQL.ID);
      },
      resolve(source, args, context, info) {
        return source.id;
      }
    },
    name: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder.find(Context.GraphQL.NAME);
      },
      resolve(source, args, context, info) {
        return source.name;
      }
    },
    description: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder.find(Context.GraphQL.DESCRIPTION);
      },
      resolve(source, args, context, info) {
        return source.description;
      }
    },
    parents: {
      type: new GraphQLList(TopicType),
      build(builder, args, path) {
        let parents = new GraphQLBuilder(Context.Knowledge.parent);

        builder.find({ parents });

        return parents;
      },
      resolve(source, args, context, info) {
        return source.parents !== null ? [].concat(source.parents) : [];
      }
        },
    children: {
      type: new GraphQLList(TopicType),
      build(builder, args, path) {
        let children = new GraphQLBuilder(Context.Knowledge.child);

        builder.find({ children });

        return children;
      },
      resolve(source, args, context, info) {
        return source.children !== null ? [].concat(source.children) : [];
      }
    },
    successors: {
      type: new GraphQLList(TopicType),
      build(builder, args, path) {
        let successors = new GraphQLBuilder(Context.Knowledge.next);

        builder.find({ successors });

        return successors;
      },
      resolve(source, args, context, info) {
        return source.successors !== null ? [].concat(source.successors) : [];
      }
    },
    predecessors: {
      type: new GraphQLList(TopicType),
      build(builder, args, path) {
        let predecessors = new GraphQLBuilder(Context.Knowledge.previous);

        builder.find({ predecessors });

        return predecessors;
      },
      resolve(source, args, context, info) {
        return source.predecessors !== null ? [].concat(source.predecessors) : [];
      }
    },
    resources: {
        type: new GraphQLList(ResourceType),
        build(builder, args, path) {
          let resources = new GraphQLBuilder(Context.Knowledge.resource);

          builder.find({ resources });

          return resources;
        },
        resolve(source, args, context, info) {
          return source.resources !== null ? [].concat(source.resources) : [];
        }
      }
  })
});

export default TopicType;
