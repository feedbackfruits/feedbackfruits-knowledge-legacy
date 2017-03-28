import { mapTypeAndSelections, BuilderFn, BuilderField, BuilderUnit, BuilderObjectType } from './index';

import {
  GraphQLList,
  FieldNode,
  OperationDefinitionNode
} from 'graphql';

import * as Context from './context';

export type SparQLArgs = { [key: string]: any };
export type SparQLBuilderFn = BuilderFn<SparQLBuilder>;
export interface SparQLUnit<TSource, TContext> extends BuilderUnit<TSource, TContext, SparQLBuilder> {
  builder: SparQLBuilder,
  args: SparQLArgs
  path: Array<string>,
};

export function buildSparQL<TSource, TContext>(unit: SparQLUnit<TSource, TContext>): SparQLBuilder {
  let { field, builder, args, path, selections } = unit;

  let type = field.type instanceof GraphQLList ? field.type.ofType : field.type;
  let newBuilder = field.build(builder, args, path);

  if (selections.length === 0) return newBuilder;
  return mapTypeAndSelections<SparQLBuilder>(type, selections)
    .reduce((newBuilder, { field: newField, name, args: newArgs, selections: newSelections }) => {
    let newPath = [].concat(path, name);
    let newUnit = {
      field: newField,
      builder: newBuilder,
      args: newArgs,
      path: newPath,
      selections: newSelections ? newSelections : []
    };

    return buildSparQL(newUnit);
  }, newBuilder);
}

export class SparQLBuilder {
  protected _uri: string;
  public mapping: {};

  constructor(uri) {
    this._uri = uri;
    this.mapping = {};
  }

  find(predicate) {
    this.mapping = Object.assign(this.mapping, predicate);
    return this;
  }

  toString() {
    const uri = this._uri;
    const mapping = this.mapping;

    const what = Object.keys(mapping).map(key => `?${key}`).join(' ') + ' ?uri';
    const where = Object.keys(mapping).map(key => `OPTIONAL { ?uri <${mapping[key]}> ?${key} . }`).join("\n");
    const filter = Object.keys(mapping).map(key => `(!isLiteral(?${key}) || lang(?${key}) = 'en')`).join(" && ");

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
    // return `{ ${this.thunk()._query.toString()} }`;
  }
}
