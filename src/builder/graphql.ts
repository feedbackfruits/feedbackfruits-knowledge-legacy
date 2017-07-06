import {
  build,
  BuilderFn,
  BuilderObjectType,
  FieldType,
  IBuilderUnit,
  mapTypeAndSelections,
} from "./index";

import {
  FieldNode,
  GraphQLList,
  OperationDefinitionNode
} from "graphql";

import cayley from "../cayley";
import * as Context from "./context";

export interface IGraphQLArgs { [key: string]: any; }

export interface IGraphQLUnit<TSource, TContext> extends IBuilderUnit<TSource, TContext, GraphQLBuilder> {
  builder: GraphQLBuilder;
  args: IGraphQLArgs;
  path: string[];
}

const irify = (str) => `<${str}>`;

export const buildAttribute = (key: string, edge: any): BuilderFn<GraphQLBuilder> => {
  return (builder: GraphQLBuilder, args) => {
    return builder.find(edge);
  };
};

export const buildRelationship =
(key: string, edge: any, directive = null, filter = null): BuilderFn<GraphQLBuilder> => {
  return (builder: GraphQLBuilder, args) => {
    const newBuilder = new GraphQLBuilder(edge);

    builder.find({ [key]: newBuilder });
    if (directive != null) {
      newBuilder.directive(directive);
    }

    if (filter != null) {
      newBuilder.filter(filter);
    }

    return newBuilder;
  };
};

export const buildRootType = (key: FieldType, type: string) => {
  return (builder: GraphQLBuilder, args, path) => {
    builder.filter({ id: type } as object);
    const mapped = Object.keys(args)
        .map(k => {
          if (k === "id") {
            return { [k]: args[k] instanceof Array ? args[k].map(irify) : irify(args[k]) };
          } else if (k === "offset") {
            return { offset: args[k] };
          } else if (k === "first") {
            return { first: args[k] };
          }

          return { [Context[k]]: `"${args[k]}"`};
        })
        .reduce((memo, value) => Object.assign(memo, value), {});

    const newBuilder = new GraphQLBuilder(`${Context.type}`);

    newBuilder.directive({ name: "rev", args: [] });
    newBuilder.filter(Object.assign({ first: 10 }, mapped));

    builder.find({ [key]: newBuilder });

    return newBuilder;
  };
};
export const resolveRootType = (key: FieldType, plural = false) => (source, args, context, info) => {
  const { operation: node, parentType: type } = info;
  const base = new GraphQLBuilder("nodes", );
  const builder = build(node, type as BuilderObjectType<GraphQLBuilder>, base, key);
  const query = `{ ${builder.toString()} }`;
  return cayley(query).then((res: any) => plural ? [].concat(res.nodes[key]) : res.nodes[key]);
};

export function buildGraphQL<TSource, TContext>(unit: IGraphQLUnit<TSource, TContext>): GraphQLBuilder {
  const { field, builder, args, path, selections } = unit;

  const type = field.type instanceof GraphQLList ? field.type.ofType : field.type;
  const newBuilder = field.build(builder, args, path);

  if (selections.length === 0) {
    return newBuilder;
  }

  mapTypeAndSelections<GraphQLBuilder>(type, selections)
    .reduce((previousBuilder, { field: newField, name, args: newArgs, selections: newSelections }) => {
    const newPath = [].concat(path, name);
    const newUnit = {
      field: newField,
      builder: previousBuilder,
      args: newArgs,
      path: newPath,
      selections: newSelections ? newSelections : []
    };

    return buildGraphQL(newUnit);
  }, newBuilder);

  return builder;
}

export interface IGraphQLBuilderDirective {
  name: string;
  args: object[];
}

export class GraphQLBuilder {
  protected _NAME: string;
  protected _FILTER: object[];
  protected _FIND: object[];
  protected _DIRECTIVES: IGraphQLBuilderDirective[];

  constructor(name: string, args: object | object[] = []) {
    this._NAME = name;
    this._FILTER = [].concat(args);
    this._FIND = [];
    this._DIRECTIVES = [];
  }

  public filter(args: object | object[]) {
    this._FILTER = [].concat(this._FILTER, args);
    return this;
  }

  public find(arg: object) {
    this._FIND.push(arg);
    return this;
  }

  public directive(directive: IGraphQLBuilderDirective) {
    this._DIRECTIVES.push(directive);
    return this;
  }

  public toString() {
    const stringifyArray = (arr) => {
      return arr.length ? `(${ stringifyObject(arr.reduce((memo, x) => Object.assign(memo, x), {})) })` : "";
    };

    const stringifyObject = (obj) => {
      return Object.keys(obj).map(key => `${key}: ${obj[key] instanceof Array ? JSON.stringify(obj[key]) : obj[key]}`);
    };

    const filterString = stringifyArray(this._FILTER);

    const directivesString = this._DIRECTIVES.map(dir => {
      const argsString = stringifyArray(dir.args);
      return `@${dir.name}${argsString}`;
    }).join(" ");

    const findString = this._FIND.map(arg => {
        if (arg instanceof GraphQLBuilder) {
          return arg.toString();
        }

        if (arg instanceof Object) {
          return stringifyObject(Object.keys(arg).reduce((memo, key) => {
            const value = arg[key];
            if (value instanceof GraphQLBuilder) {
              memo[key] = value.toString();
            } else {
              memo[key] = value;
            }

            return memo;
          }, {}));
        }

        return arg;
      }).join(",\n");

    return `${this._NAME}${filterString} ${directivesString}{
      ${findString}
    }`;
  }
}
