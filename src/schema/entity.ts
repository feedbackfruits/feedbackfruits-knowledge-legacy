import {
  graphql,
  GraphQLList,
  GraphQLString,
} from 'graphql';

import { BuilderObjectType } from '../builder';
import { SparQLBuilder } from '../builder/sparql';
import * as Context from '../builder/context';


export const EntityType: BuilderObjectType<SparQLBuilder> = new BuilderObjectType<SparQLBuilder>({
  name: 'EntityType',
  builderType: 'sparql',
  fields: () => ({
    id: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder;
        // return builder.find(Context.SparQL.ID);
      },
      resolve(source, args, context, info) {
        return source.uri;
      }
    },
    name: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder.find(Context.SparQL.NAME);
      },
      resolve(source, args, context, info) {
        return source.name;
      }
    },
    description: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder.find(Context.SparQL.DESCRIPTION);
      },
      resolve(source, args, context, info) {
        return source.description;
      }
    },
    image: {
      type: GraphQLString,
      build(builder, args, path) {
        return builder.find(Context.SparQL.IMAGE);
      },
      resolve(source, args, context, info) {
        return source.image;
      }
    }
  })
});

export default EntityType;
