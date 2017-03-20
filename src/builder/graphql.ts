import { mapTypeAndSelections, BuilderFn, BuilderField, BuilderUnit, BuilderObjectType } from './index';

import {
  GraphQLList,
  FieldNode,
  OperationDefinitionNode
} from 'graphql';

import Query = require('graphql-query-builder');

import * as Context from './context';

export type GraphQLArgs = { [key: string]: any };
export type GraphQLBuilderFn = BuilderFn<GraphQLBuilder>;
export interface GraphQLUnit<TSource, TContext> extends BuilderUnit<TSource, TContext, GraphQLBuilder> {
  builder: GraphQLBuilder,
  args: GraphQLArgs
  path: Array<string>,
};

export function buildGraphQL<TSource, TContext>(unit: GraphQLUnit<TSource, TContext>): GraphQLBuilder {
  let { field, builder, args, path, selections } = unit;

  let type = field.type instanceof GraphQLList ? field.type.ofType : field.type;
  let newBuilder = field.build(builder, args, path);

  if (selections.length === 0) return newBuilder;
  mapTypeAndSelections<GraphQLBuilder>(type, selections)
    .reduce((newBuilder, { field: newField, name, args: newArgs, selections: newSelections }) => {
    let newPath = [].concat(path, name);
    let newUnit = {
      field: newField,
      builder: newBuilder,
      args: newArgs,
      path: newPath,
      selections: newSelections ? newSelections : []
    };

    return buildGraphQL(newUnit);
  }, newBuilder);

  return builder;
}

export class GraphQLBuilder {
  protected _query: any;
  protected _find: Array<any>;

  constructor(name: string, args: any = null) {
    this._query = new Query(name, args);
    this._find = [];
  }

  filter(args: any) {
    this._query.filter(args);
    return this;
  }

  find(arg: any) {
    this._find.push(arg);
    return this;
  }

  thunk() {
    let args = this._find.map(arg => {
      if (arg instanceof GraphQLBuilder) {
        arg.thunk();
        return arg._query;
      }

      if (arg instanceof Object) {
        return Object.keys(arg).reduce((memo, key) => {
          let value = arg[key];
          if (value instanceof GraphQLBuilder) {
            value.thunk();
            memo[key] = value._query;
          }
          else memo[key] = value;
          return memo;
        }, {});
      }

      return arg;
    });

    if (args.length === 1) this._query.find(args[0]);
    else this._query.find(args);

    return this;
  }

  toString() {
    return `{ ${this.thunk()._query.toString()} }`;
  }
}
