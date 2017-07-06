import { BuilderFn, BuilderObjectType, IBuilderUnit, mapTypeAndSelections } from "../index";

import {
  FieldNode,
  GraphQLList,
  OperationDefinitionNode
} from "graphql";

import * as Morphisms from "./morphisms";

export interface IGizmoBuilder {
  V: (...args: Array<string | string[]>) => IGizmoBuilder;
  M: () => IGizmoBuilder;
  In: (...args: Array<string | string[]>) => IGizmoBuilder;
  Out: (...args: Array<string | string[]>) => IGizmoBuilder;
  Follow: (path: IGizmoBuilder) => IGizmoBuilder;
  Save: (predicate: string, tag: string) => IGizmoBuilder;
  Tag: (tag: string) => IGizmoBuilder;
  Back: (tag: string) => IGizmoBuilder;
  All: (callback: any) => void;
}

export interface IGizmoArgs { [key: string]: any; }
export type IGizmoBuilderFn = BuilderFn<IGizmoBuilder>;
export interface IGizmoUnit<TSource, TContext> extends IBuilderUnit<TSource, TContext, IGizmoBuilder> {
  builder: IGizmoBuilder;
  args: IGizmoArgs;
  path: string[];
}

export function buildGizmo<TSource, TContext>(unit: IGizmoUnit<TSource, TContext>): IGizmoBuilder {
  const { field, builder, args, path, selections } = unit;

  const type = field.type instanceof GraphQLList ? field.type.ofType : field.type;
  const newBuilder = field.build(builder, args, path);

  if (selections.length === 0) {
    return newBuilder;
  }

  return mapTypeAndSelections<IGizmoBuilder>(type, selections)
    .reduce((previousBuilder, { field: newField, name, args: newArgs, selections: newSelections }) => {
    const newPath = [].concat(path, name);
    const newUnit = {
      field: newField,
      builder: previousBuilder,
      args: newArgs,
      path: newPath,
      selections: newSelections ? newSelections : []
    };

    return buildGizmo(newUnit);
  }, newBuilder).Back(`${path.join(".")}.id`);
}
