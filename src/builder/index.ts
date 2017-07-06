import {
  ArgumentNode,
  FieldNode,
  graphql,
  GraphQLArgument,
  GraphQLEnumType,
  GraphQLField,
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
  GraphQLFieldMap,
  GraphQLInterfaceType,
  GraphQLInterfaceTypeConfig,
  GraphQLList,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLSchema,
  GraphQLString,
  ListValueNode,
  OperationDefinitionNode,
  StringValueNode,
  Thunk
} from "graphql";

import { buildGizmo, IGizmoBuilder } from "./gizmo";
import { buildGraphQL, GraphQLBuilder } from "./graphql";
import { buildSparQL, SparQLBuilder } from "./sparql";

import { BuilderInterfaceType } from "./interface_type";
import { BuilderObjectType } from "./object_type";

export { BuilderInterfaceType, BuilderObjectType };

export type BuilderFn<TBuilder> = (builder: TBuilder, args: { [argName: string]: any }, path?: string[]) => TBuilder;

export interface IBuilderInterfaceTypeConfig<TSource, TContext, TBuilder> extends GraphQLInterfaceTypeConfig<TSource, TContext> {
  builderType?: BuilderType;
  fields: Thunk<IBuilderFieldConfigMap<TSource, TContext, TBuilder>>;
}

export interface IBuilderFieldConfigMap<TSource, TContext, TBuilder> {
  [fieldName: string]: IBuilderFieldConfig<TSource, TContext, TBuilder>;
}

export interface IBuilderFieldConfig<TSource, TContext, TBuilder> extends GraphQLFieldConfig<TSource, TContext> {
  build: BuilderFn<TBuilder>;
}

export interface IBuilderUnit<TSource, TContext, TBuilder> {
  field: IBuilderField<TSource, TContext, TBuilder>;
  selections: FieldNode[];
}

export interface IBuilderField<TSource, TContext, TBuilder> extends GraphQLField<TSource, TContext> {
  build: BuilderFn<TBuilder>;
}

export const buildNoop = () => (builder, args) => builder;

export function mapArguments(args) {
  return args.reduce((memo, arg: ArgumentNode) => {
    const { name: { value: name } } = arg;
    let value;

    if ((arg.value.kind) === "ListValue") {
      value = (arg.value as ListValueNode).values.map(v => (v as StringValueNode).value);
    } else {
      value = (arg.value as StringValueNode).value;
    }

    memo[name] = value;

    return memo;
  }, {});
}

export function mapTypeAndSelections<TBuilder>(type: BuilderObjectType<TBuilder>, selections: FieldNode[]) {
  const fields = type.getFields();
  return selections.map(s => {
    const { name: { value: name } } = s;
    const field = fields[name];
    const args = mapArguments(s.arguments);

    return {
      field,
      name,
      selections: s.selectionSet ? s.selectionSet.selections as FieldNode[] : null,
      args
    };
  });
}

export type BuilderType = "graphql" | "sparql";
export type FieldType =
  "fieldOfStudy" | "topic" | "entity" | "resource" |
  "fieldsOfStudy" | "topics" | "entities" | "resources";
export function build<TBuilder>(
  node: OperationDefinitionNode | FieldNode,
  type: BuilderObjectType<TBuilder>,
  builder: TBuilder, fieldName: FieldType
): TBuilder {
  const mapped = mapTypeAndSelections<TBuilder>(type, node.selectionSet.selections as FieldNode[]).map(x => {
    const {
      field,
      name,
      args,
      selections
    } = x;

    const u = {
      field,
      builder,
      args,
      path: [ name ],
      selections
    };

    return u;
  });

  const unit =  mapped.length === 1 ? mapped[0] : mapped.find(u => {
    return u.field.name === fieldName;
  });

  const fieldType = unit.field.type instanceof GraphQLList ? unit.field.type.ofType : unit.field.type;

  if (fieldType.builderType === "graphql") {
    return buildGraphQL(unit as any) as any;
  }

  if (fieldType.builderType === "sparql") {
    return buildSparQL(unit as any) as any;
  }

  throw new Error(`Invalid builder type: ${fieldType.builderType}`);
}
