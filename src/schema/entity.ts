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

import { FieldOfStudyType } from './field_of_study'
import ResourceInterfaceType from './resource';

const deirify = iri => iri.slice(1, iri.length - 1);

export const EntityType: BuilderObjectType<GraphQLBuilder> = new BuilderObjectType<GraphQLBuilder>({
  name: 'EntityType',
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
    type: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder;
      },
      resolve(source, args, context, info) {
        return deirify(Context.Knowledge.Entity);
      }
    },
    fieldsOfStudy: {
      type: new GraphQLList(FieldOfStudyType),
      build(builder, args, path) {
        let fieldsOfStudy = new GraphQLBuilder(`${Context.sameAs} @rev`);

        builder.find({ fieldsOfStudy });

        return fieldsOfStudy;
      },
      resolve(source, args, context, info) {
        return source.fieldsOfStudy !== null ? [].concat(source.fieldsOfStudy) : [];
      }
    },
    resources: {
      type: new GraphQLList(ResourceInterfaceType),
      build(builder, args, path) {
        let resources = new GraphQLBuilder(`${Context.about} @rev`);

        builder.find({ resources });

        return resources;
      },
      resolve(source, args, context, info) {
        return source.resources !== null ? [].concat(source.resources) : [];
      }
    }
  })
});

export default EntityType;
