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
  FieldNode
} from 'graphql';

export interface BuilderFn<TBuilder> {
  (builder: TBuilder, args: { [argName: string]: any }, path: string): TBuilder
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


export function build<TBuilder>(node: FieldNode, type: BuilderObjectType<TBuilder>, builder: TBuilder, path = '') {
  if (node.selectionSet) {
    node.selectionSet.selections.map((selection: FieldNode) => {
      // doThings(selection, );
    });
  }
}
