import {
  GraphQLList,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { BuilderInterfaceType } from '../../builder';
import { buildAttribute, buildRelationship, GraphQLBuilder } from '../../builder/graphql';
import * as Context from '../../builder/context';

import EntityType from '../entity';
import TopicType from '../topic';

import VideoResourceType from './video';

export const ResourceInterfaceType: BuilderInterfaceType<GraphQLBuilder> = new BuilderInterfaceType<GraphQLBuilder>({
  name: 'ResourceInterface',
  builderType: 'graphql',
  resolveType: () => {
    return VideoResourceType;
  },
  fields: () => ({
    id: {
      type: GraphQLString,
      build: buildAttribute('id', Context.GraphQL.ID),
      resolve(source, args, context, info) {
        return source.id;
      }
    },
    type: {
      type: GraphQLString,
      build: buildAttribute('type', Context.GraphQL.TYPE),
      resolve(source, args, context, info) {
        return source.type[0];
      }
    },
    name: {
      type: GraphQLString,
      build: buildAttribute('name', Context.GraphQL.NAME),
      resolve(source, args, context, info) {
        return source.name;
      }
    },
    description: {
      type: GraphQLString,
      build: buildAttribute('description', Context.GraphQL.DESCRIPTION),
      resolve(source, args, context, info) {
        return source.description;
      }
    },
    image: {
      type: GraphQLString,
      build: buildAttribute('image', Context.GraphQL.IMAGE),
      resolve(source, args, context, info) {
        return source.image;
      }
    },
    license: {
      type: GraphQLString,
      build: buildAttribute('license', Context.GraphQL.LICENSE),
      resolve(source, args, context, info) {
        return source.license;
      }
    },
    sourceOrganization: {
      type: GraphQLString,
      build: buildAttribute('license', Context.GraphQL.SOURCE_ORGANIZATION),
      resolve(source, args, context, info) {
        return source.sourceOrganization;
      }
    },
    entities: {
      type: new GraphQLList(EntityType),
      build: buildRelationship('entities', Context.about),
      resolve(source, args, context, info) {
        return source.entities !== null ? [].concat(source.entities) : [];
      }
    },
    topics: {
      type: new GraphQLList(TopicType),
      build: buildRelationship('topics', Context.Knowledge.topic),
      resolve(source, args, context, info) {
        return source.topics !== null ? [].concat(source.topics) : [];
      }
    }
  })
});

export default ResourceInterfaceType;
