import { BuilderFn, BuilderObjectType, IBuilderUnit, mapTypeAndSelections } from "./index";

import {
  FieldNode,
  GraphQLList,
  OperationDefinitionNode
} from "graphql";

import * as Context from "./context";

export interface ISparQLArgs { [key: string]: any; }
export type SparQLBuilderFn = BuilderFn<SparQLBuilder>;
export interface ISparQLUnit<TSource, TContext> extends IBuilderUnit<TSource, TContext, SparQLBuilder> {
  builder: SparQLBuilder;
  args: ISparQLArgs;
  path: string[];
}

export function buildSparQL<TSource, TContext>(unit: ISparQLUnit<TSource, TContext>): SparQLBuilder {
  const { field, builder, args, path, selections } = unit;

  const type = field.type instanceof GraphQLList ? field.type.ofType : field.type;
  const newBuilder = field.build(builder, args, path);

  if (selections.length === 0) {
    return newBuilder;
  }

  return mapTypeAndSelections<SparQLBuilder>(type, selections)
    .reduce((previousBuilder, { field: newField, name, args: newArgs, selections: newSelections }) => {
    const newPath = [].concat(path, name);
    const newUnit = {
      field: newField,
      builder: previousBuilder,
      args: newArgs,
      path: newPath,
      selections: newSelections ? newSelections : []
    };

    return buildSparQL(newUnit);
  }, newBuilder);
}

export class SparQLBuilder {
  public mapping: {};
  protected _URI: string;

  constructor(uri) {
    this._URI = uri;
    this.mapping = {};
  }

  public find(predicate) {
    this.mapping = Object.assign(this.mapping, predicate);
    return this;
  }

  public toString() {
    const uri = this._URI;
    const mapping = this.mapping;

    const what = Object.keys(mapping).map(key => `?${key}`).join(" ") + " ?uri";
    const where = Object.keys(mapping).map(key => `OPTIONAL { ?uri <${mapping[key]}> ?${key} . }`).join("\n");
    const filter = Object.keys(mapping).map(key => `(!isLiteral(?${key}) || lang(?${key}) = "en")`).join(" && ");

    const query = `
      SELECT DISTINCT ${what} WHERE {
        {
          values ?uri { <${uri}> }
          ${where}
        } UNION {
          values ?alt_id { <${uri}> }
          ?alt_id <${Context.DBPedia.redirects}> ?uri .
          ${where}
        }
        FILTER(${filter})
      }
    `;

    return query;
  }
}
