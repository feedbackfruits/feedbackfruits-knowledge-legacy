import {
  graphql,
  GraphQLSchema,
  GraphQLArgument,
  GraphQLEnumType,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  GraphQLObjectTypeConfig,
  GraphQLField,
  GraphQLFieldMap,
  GraphQLFieldConfigMap,
  GraphQLFieldConfig,
  Thunk,
  FieldNode,
  ArgumentNode,
  StringValueNode,
  OperationDefinitionNode
} from 'graphql';

import { buildGizmo, GizmoBuilder } from './gizmo';
import { buildGraphQL, GraphQLBuilder } from './graphql';

export interface BuilderFn<TBuilder> {
  (builder: TBuilder, args: { [argName: string]: any }, path: Array<string>): TBuilder
}

export class BuilderObjectType<TBuilder> extends GraphQLObjectType {
  constructor(config: BuilderObjectTypeConfig<any, any, TBuilder>) {
    super(config);
  }
  getFields(): BuilderFieldMap<any, any, TBuilder> {
    return <BuilderFieldMap<any, any, TBuilder>> super.getFields();
  }
}

export interface BuilderObjectTypeConfig<TSource, TContext, TBuilder> extends GraphQLObjectTypeConfig<TSource, TContext> {
  fields: Thunk<BuilderFieldConfigMap<TSource, TContext, TBuilder>>
}

export interface BuilderField<TSource, TContext, TBuilder> extends GraphQLField<TSource, TContext> {
  build: BuilderFn<TBuilder>
}

export interface BuilderFieldConfig<TSource, TContext, TBuilder> extends GraphQLFieldConfig<TSource, TContext> {
  build: BuilderFn<TBuilder>
}
export interface BuilderFieldMap<TSource, TContext, TBuilder> extends GraphQLFieldMap<TSource, TContext> {
  [fieldName: string]: BuilderField<TSource, TContext, TBuilder>;
}

export interface BuilderFieldConfigMap<TSource, TContext, TBuilder> {
  [fieldName: string]: BuilderFieldConfig<TSource, TContext, TBuilder>;
}

export interface BuilderUnit<TSource, TContext, TBuilder> {
  field: BuilderField<TSource, TContext, TBuilder>,
  selections: Array<FieldNode>
}

export function mapArguments(args) {
  return args.reduce((memo, arg: ArgumentNode) => {
    let { name: { value: name } } = arg;
    let { value } = (<StringValueNode>arg.value);
    memo[name] = value;
    return memo;
  }, {});
}

export function mapTypeAndSelections<TBuilder>(type: BuilderObjectType<TBuilder>, selections: FieldNode[]) {
  let fields = type.getFields()
  return selections.map(s => {
    let { name: { value: name } } = s;
    let field = fields[name];
    let args = mapArguments(s.arguments);

    return {
      field,
      name,
      selections: s.selectionSet ? <Array<FieldNode>>s.selectionSet.selections : null,
      args
    };
  });
}

export function build<TBuilder>(node: OperationDefinitionNode | FieldNode, type: BuilderObjectType<TBuilder>, builder: TBuilder): TBuilder {
  let [ {
    field,
    name,
    args,
    selections
  } ] = mapTypeAndSelections<TBuilder>(type, <Array<FieldNode>>node.selectionSet.selections);

  let unit = {
    field,
    builder,
    args,
    path: [ name ],
    selections
  };

  return <any>buildGraphQL(<any>unit);
}
