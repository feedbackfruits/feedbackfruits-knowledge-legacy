import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLString,
} from "graphql";

import { Context } from 'feedbackfruits-knowledge-engine';

import graph from './semantic-graph';

export const SearchType = new GraphQLObjectType({
  name: "SearchType",
  fields: {
    meta: {
      type: new GraphQLObjectType({
        name: "SearchMetaType",
        fields: {
          page: {
            type: GraphQLInt,
            resolve(source, args, context, info) {
              return source.page;
            }
          },
          perPage: {
            type: GraphQLInt,
            resolve(source, args, context, info) {
              return source.perPage;
            }
          },
          totalPages: {
            type: GraphQLInt,
            resolve(source, args, context, info) {
              return source.totalPages;
            }
          },
          totalResults: {
            type: GraphQLInt,
            resolve(source, args, context, info) {
              return source.totalResults;
            }
          },
        }
      }),
      resolve(source, args, context, info) {
        return source.meta;
      }
    },
    results: {
      type: new GraphQLList(graph.getInterfaceType(Context.iris.$.SearchResult)),
      resolve: async (source, args, context) => {
        // console.log('Source results:', source.results);
        return source.results.map(result => {
          return {
            score: result.score,
            result: result
          }
        });
      }
    },
  }
});

export default SearchType;
