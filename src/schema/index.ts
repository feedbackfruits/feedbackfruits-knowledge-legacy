import {
  graphql,
  GraphQLSchema,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  FieldNode
} from 'graphql';

import { FieldOfStudyType } from './field_of_study';
import { EntityType } from './entity';

import { build, BuilderObjectType } from '../builder';
import { GraphQLBuilder } from '../builder/graphql';
import { SparQLBuilder } from '../builder/sparql';

import * as Context from '../builder/context';

import cayley from '../cayley';
import dbpedia from '../dbpedia';

export const Schema = new GraphQLSchema({
  query: new BuilderObjectType<GraphQLBuilder | SparQLBuilder>({
    name: 'RootQueryType',
    fields: {
      fieldOfStudy: {
        type: FieldOfStudyType,
        args: {
          id: {
            type: GraphQLString,
          },
          name: {
            type: GraphQLString
          }
        },

        build(builder: GraphQLBuilder, { id, name }, path) {
          if (id != null && name == null) return builder.filter({ id: `<${id}>` });

          let fieldOfStudy = new GraphQLBuilder(`${Context.name} @rev`);

          builder.filter({ id: name });
          builder.find({ fieldOfStudy });

          return fieldOfStudy;
        },
        resolve(source, { }, context, info) {
          let { operation: node, parentType: type } = info;
          let base = new GraphQLBuilder('nodes',);
          let builder = build(node, <BuilderObjectType<GraphQLBuilder>>type, base, 'fieldOfStudy');
          let query = builder.toString();
          return cayley(query).then((res: any) => res.nodes.fieldOfStudy);
        }
      },
      entity: {
        type: EntityType,
        args: {
          id: {
            type: GraphQLString,
          },
          name: {
            type: GraphQLString
          }
        },

        build(builder, { id }, path) {
          let uri = id;
          return new SparQLBuilder(uri);
        },
        resolve(source, { }, context, info) {
          let { operation: node, parentType: type } = info;
          let builder = build(node, <BuilderObjectType<SparQLBuilder>>type, null, 'entity');
          let { mapping } = builder;
          let query = builder.toString();
          return dbpedia(query, mapping);
        }
      }
    }
  })
});

export default Schema;
