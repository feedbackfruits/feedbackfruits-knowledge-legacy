import { mapTypeAndSelections, BuilderFn, BuilderField, BuilderUnit, BuilderObjectType } from './index';

import {
  GraphQLList,
  FieldNode,
  OperationDefinitionNode
} from 'graphql';

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

export type GraphQLBuilderDirective = { name: string, args: Array<Object> };

export class GraphQLBuilder {
  protected _name: string;
  protected _filter: Array<Object>;
  protected _find: Array<Object>;
  protected _directives: Array<GraphQLBuilderDirective>;

  constructor(name: string, args: Object | Array<Object> = []) {
    this._name = name;
    this._filter = [].concat(args);
    this._find = [];
    this._directives = [];
  }

  filter(args: Object | Array<Object>) {
    this._filter = [].concat(this._filter, args);
    return this;
  }

  find(arg: Object) {
    this._find.push(arg);
    return this;
  }

  directive(directive: GraphQLBuilderDirective) {
    this._directives.push(directive);
    return this;
  }

  toString() {
    let stringifyArray = (arr) => arr.length ? `(${ stringifyObject(arr.reduce((memo, x) => Object.assign(memo, x), {})) })` : '';
    let stringifyObject = (obj) => Object.keys(obj).map(key => `${key}: ${obj[key]}`);

    let filterString = stringifyArray(this._filter);

    let directivesString = this._directives.map(dir => {
      let argsString = stringifyArray(dir.args);
      return `@${dir.name}${argsString}`;
    }).join(' ');

    let findString = this._find.map(arg => {
        if (arg instanceof GraphQLBuilder) {
          return arg.toString();
        }

        if (arg instanceof Object) {
          return stringifyObject(Object.keys(arg).reduce((memo, key) => {
            let value = arg[key];
            if (value instanceof GraphQLBuilder) {
              memo[key] = value.toString();
            }
            else memo[key] = value;
            return memo;
          }, {}));
        }

        return arg;
      }).join(',\n');

    return `${this._name}${filterString} ${directivesString}{
      ${findString}
    }`;
  }
}
