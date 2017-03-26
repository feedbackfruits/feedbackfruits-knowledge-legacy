import {
  graphql,
  GraphQLSchema,
  GraphQLArgument,
  GraphQLEnumType,
  GraphQLList,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLString,
  GraphQLObjectTypeConfig,
  GraphQLInterfaceTypeConfig,
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
import { buildSparQL, SparQLBuilder } from './sparql';

export interface BuilderFn<TBuilder> {
  (builder: TBuilder, args: { [argName: string]: any }, path: Array<string>): TBuilder
}

export class BuilderInterfaceType<TBuilder> extends GraphQLInterfaceType {
  public builderType: BuilderType;

  constructor(config: BuilderInterfaceTypeConfig<any, any, TBuilder>) {
    super(config);
    this.builderType = config.builderType;
  }
  getFields(): BuilderFieldMap<any, any, TBuilder> {
    return <BuilderFieldMap<any, any, TBuilder>> super.getFields();
  }
}

export interface BuilderInterfaceTypeConfig<TSource, TContext, TBuilder> extends GraphQLInterfaceTypeConfig<TSource, TContext> {
  builderType?: BuilderType
  fields: Thunk<BuilderFieldConfigMap<TSource, TContext, TBuilder>>
}

export class BuilderObjectType<TBuilder> extends GraphQLObjectType {
  public builderType: BuilderType

  constructor(config: BuilderObjectTypeConfig<any, any, TBuilder>) {
    super(config);
    this.builderType = config.builderType;
  }
  getFields(): BuilderFieldMap<any, any, TBuilder> {
    return <BuilderFieldMap<any, any, TBuilder>> super.getFields();
  }
}

export interface BuilderObjectTypeConfig<TSource, TContext, TBuilder> extends GraphQLObjectTypeConfig<TSource, TContext> {
  builderType?: BuilderType
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

export type BuilderType = 'graphql' | 'sparql';
export type FieldType = 'fieldOfStudy' | 'topic' | 'entity' | 'resources' | 'videos';
export function build<TBuilder>(node: OperationDefinitionNode | FieldNode, type: BuilderObjectType<TBuilder>, builder: TBuilder, fieldName: FieldType): TBuilder {
  let mapped = mapTypeAndSelections<TBuilder>(type, <Array<FieldNode>>node.selectionSet.selections).map(x => {
    let {
      field,
      name,
      args,
      selections
    } = x;

    let unit = {
      field,
      builder,
      args,
      path: [ name ],
      selections
    };

    return unit;
  });

  // if (mapped.length === 1) {
  // } else {
  //
  //   let unit = <any>mapped.find((unit, i): any => {
  //     // if (memo) return memo;
  //     return unit.field.name === fieldName;
  //   });
  // }

  let unit =  mapped.length === 1 ? mapped[0] : mapped.find(unit => {
    return unit.field.name === fieldName;
  });

  let fieldType = unit.field.type instanceof GraphQLList ? unit.field.type.ofType : unit.field.type;

  if (fieldType.builderType === 'graphql') return <any>buildGraphQL(<any>unit);
  if (fieldType.builderType === 'sparql') return <any>buildSparQL(<any>unit);
  throw new Error(`Invalid builder type: ${fieldType.builderType}`)
}
