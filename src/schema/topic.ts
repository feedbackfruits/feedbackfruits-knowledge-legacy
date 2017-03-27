import {
  graphql,
  GraphQLList,
  GraphQLString,
} from 'graphql';

import { BuilderObjectType } from '../builder';
import { buildAttribute, buildRelationship, GraphQLBuilder } from '../builder/graphql';
import * as Context from '../builder/context';

import ResourceType from './resource';

export const TopicType: BuilderObjectType<GraphQLBuilder> = new BuilderObjectType<GraphQLBuilder>({
  name: 'Topic',
  builderType: 'graphql',
  fields: () => ({
    id: {
      type: GraphQLString,
      build: buildAttribute('id', Context.GraphQL.ID),
      resolve(source, args, context, info) {
        return source.id;
      }
    },
    name: {
      type: GraphQLString,
      build: buildAttribute('name', Context.GraphQL.NAME),
      resolve(source, args, context, info) {
        return source.name;
      }
    },
    type: {
      type: GraphQLString,
      build: buildAttribute('type', Context.GraphQL.TYPE),
      resolve(source, args, context, info) {
        return source.type;
      }
    },
    description: {
      type: GraphQLString,
      build: buildAttribute('description', Context.GraphQL.DESCRIPTION),
      resolve(source, args, context, info) {
        return source.description;
      }
    },
    parents: {
      type: new GraphQLList(TopicType),
      build: buildRelationship('parents', Context.Knowledge.parent),
      resolve(source, args, context, info) {
        return source.parents !== null ? [].concat(source.parents) : [];
      }
        },
    children: {
      type: new GraphQLList(TopicType),
      build: buildRelationship('children', Context.Knowledge.child),
      resolve(source, args, context, info) {
        return source.children !== null ? [].concat(source.children) : [];
      }
    },
    successors: {
      type: new GraphQLList(TopicType),
      build: buildRelationship('successors', Context.Knowledge.next),
      resolve(source, args, context, info) {
        return source.successors !== null ? [].concat(source.successors) : [];
      }
    },
    predecessors: {
      type: new GraphQLList(TopicType),
      build: buildRelationship('predecessors', Context.Knowledge.previous),
      resolve(source, args, context, info) {
        return source.predecessors !== null ? [].concat(source.predecessors) : [];
      }
    },
    resources: {
        type: new GraphQLList(ResourceType),
        build: buildRelationship('resources', Context.Knowledge.resource),
        resolve(source, args, context, info) {
          return source.resources !== null ? [].concat(source.resources) : [];
        }
      }
  })
});

export default TopicType;
