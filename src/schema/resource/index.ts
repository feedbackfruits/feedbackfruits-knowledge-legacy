import {
  GraphQLList,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { BuilderInterfaceType } from '../../builder';
import { GraphQLBuilder } from '../../builder/graphql';
import * as Context from '../../builder/context';

import FieldOfStudyType from '../field_of_study';

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
    // fieldsOfStudy: {
    //   type: new GraphQLList(FieldOfStudyType),
    //   build(builder, args, path) {
    //     let fieldsOfStudy = new GraphQLBuilder(Context.about);
    //
    //     builder.find({ fieldsOfStudy });
    //
    //     return fieldsOfStudy;
    //   },
    //   resolve(source, args, context, info) {
    //     return source.fieldsOfStudy !== null ? [].concat(source.fieldsOfStudy) : [];
    //   }
    // }
  })
});

export default ResourceInterfaceType;
