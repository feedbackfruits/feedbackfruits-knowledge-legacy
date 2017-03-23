import {
  GraphQLList,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { BuilderObjectType } from '../../builder';
import { GraphQLBuilder } from '../../builder/graphql';
import * as Context from '../../builder/context';

import { ResourceInterfaceType } from '.';

export const VideoResourceType: BuilderObjectType<GraphQLBuilder> = new BuilderObjectType<GraphQLBuilder>({
  name: 'VideoResourceType',
  builderType: 'graphql',
  interfaces: () => [ ResourceInterfaceType ],
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
    }
  })
});

export default VideoResourceType;
