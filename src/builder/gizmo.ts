import { mapTypeAndSelections, BuilderFn, BuilderField, BuilderUnit, BuilderObjectType } from './index';

import {
  GraphQLList,
  FieldNode,
  OperationDefinitionNode
} from 'graphql';

import cayley = require('node-cayley');

import {
  CAYLEY_ADDRESS
} from '../config';

const client = cayley(CAYLEY_ADDRESS);
export const graph: GizmoBuilder = client.g;

import * as Context from './context';

export module Morphisms {
  export const fieldOfStudy = (key: string = 'fieldOfStudy') => graph.M()
    .Save(Context.name, `${key}_name`)
    .Save(Context.image, `${key}_image`)
    .Tag(`${key}_id`)

  export const parents = (key: string = 'parent') => graph.M()
    .Out(Context.AcademicGraph.parentFieldOfStudy)

  export const children = (key: string = 'child') => graph.M()
    .Out(Context.AcademicGraph.childFieldOfStudy)
}

export type GizmoBuilder = {
  V: (...args: Array<string | Array<string>>) => GizmoBuilder
  M: () => GizmoBuilder
  In: (...args: Array<string | Array<string>>) => GizmoBuilder
  Out: (...args: Array<string | Array<string>>) => GizmoBuilder
  Follow: (path: GizmoBuilder) => GizmoBuilder
  Save: (predicate: string, tag: string) => GizmoBuilder
  Tag: (tag: string) => GizmoBuilder
  Back: (tag: string) => GizmoBuilder
  All: (callback: any) => void
};

export type GizmoArgs = { [key: string]: any };
export type GizmoBuilderFn = BuilderFn<GizmoBuilder>;
export interface GizmoUnit<TSource, TContext> extends BuilderUnit<TSource, TContext, GizmoBuilder> {
  builder: GizmoBuilder,
  args: GizmoArgs
  path: Array<string>,
};

export function buildGizmo<TSource, TContext>(unit: GizmoUnit<TSource, TContext>): GizmoBuilder {
  let { field, builder, args, path, selections } = unit;

  let type = field.type instanceof GraphQLList ? field.type.ofType : field.type;
  let newBuilder = field.build(builder, args, path);

  if (selections.length === 0) return newBuilder;
  return mapTypeAndSelections<GizmoBuilder>(type, selections)
    .reduce((newBuilder, { field: newField, name, args: newArgs, selections: newSelections }) => {
    let newPath = [].concat(path, name);
    let newUnit = {
      field: newField,
      builder: newBuilder,
      args: newArgs,
      path: newPath,
      selections: newSelections ? newSelections : []
    };

    return buildGizmo(newUnit);
  }, newBuilder).Back(`${path.join('.')}.id`);
}
