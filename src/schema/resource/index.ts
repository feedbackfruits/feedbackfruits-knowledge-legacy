import {
  GraphQLList,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { BuilderInterfaceType } from '../../builder';
import { GraphQLBuilder } from '../../builder/graphql';
import * as Context from '../../builder/context';

import EntityType from '../entity';
import TopicType from '../topic';

import VideoResourceType from './video';

export const ResourceInterfaceType: BuilderInterfaceType<GraphQLBuilder> = new BuilderInterfaceType<GraphQLBuilder>({
  name: 'ResourceInterfaceType',
  builderType: 'graphql',
  resolveType: () => {
    return VideoResourceType;
  },
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
    type: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder.find(Context.GraphQL.TYPE);
      },
      resolve(source, args, context, info) {
        return source.type[0];
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
    image: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder.find(Context.GraphQL.IMAGE);
      },
      resolve(source, args, context, info) {
        return source.image;
      }
    },
    license: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder.find(Context.GraphQL.LICENSE);
      },
      resolve(source, args, context, info) {
        return source.license;
      }
    },
    entities: {
      type: new GraphQLList(EntityType),
      build(builder, args, path) {
        let entities = new GraphQLBuilder(Context.about);

        builder.find({ entities });

        return entities;
      },
      resolve(source, args, context, info) {
        return source.entities !== null ? [].concat(source.entities) : [];
      }
    },
    topics: {
      type: new GraphQLList(TopicType),
      build(builder, args, path) {
        let topics = new GraphQLBuilder(Context.Knowledge.topic);

        builder.find({ topics });

        return topics;
      },
      resolve(source, args, context, info) {
        return source.topics !== null ? [].concat(source.topics) : [];
      }
    }
  })
});

export default ResourceInterfaceType;
