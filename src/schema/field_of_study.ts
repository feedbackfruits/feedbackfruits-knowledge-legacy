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


export const FieldOfStudyType: BuilderObjectType<GraphQLBuilder> = new BuilderObjectType<GraphQLBuilder>({
  name: 'FieldOfStudyType',
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
    image: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder.find(Context.GraphQL.IMAGE);
      },
      resolve(source, args, context, info) {
        return source.image;
      }
    },
    parents: {
      type: new GraphQLList(FieldOfStudyType),
      build(builder, args, path) {
        let parents = new GraphQLBuilder(Context.AcademicGraph.parentFieldOfStudy);

        builder.find({ parents });

        return parents;
      },
      resolve(source, args, context, info) {
        return source.parents !== null ? [].concat(source.parents) : [];
      }
        },
    children: {
      type: new GraphQLList(FieldOfStudyType),
      build(builder, args, path) {
        let children = new GraphQLBuilder(Context.AcademicGraph.childFieldOfStudy);

        builder.find({ children });

        return children;
      },
      resolve(source, args, context, info) {
        return source.children !== null ? [].concat(source.children) : [];
      }
    }
  })
});

export default FieldOfStudyType;
