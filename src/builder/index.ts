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

export function normalizeName(name) {
  return name.toLowerCase().replace(/[\W]/g, ' ').replace(/ +/g, ' ').trim();
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

export function reduceFieldAndSelections<TBuilder>(builder, { field, selections, args }, path) {
  let type = field.type instanceof GraphQLList ? field.type.ofType : field.type;
  let newBuilder = field.build(builder, args, path);
  return selections.reduce((b, s) => {
    return build(s, <BuilderObjectType<TBuilder>>type, b, path);
  }, newBuilder);
}

export function build<TBuilder>(node: FieldNode | OperationDefinitionNode, type: BuilderObjectType<TBuilder>, builder: TBuilder, path = ''): TBuilder {
  if (node.kind === 'OperationDefinition') {
    // This makes sure the graph traversal is initiated properly
    let fieldMap = mapTypeAndSelections(type, <Array<FieldNode>>node.selectionSet.selections);
    return fieldMap.reduce((builder, fieldMap) => {
      return reduceFieldAndSelections(builder, fieldMap, path);
    }, builder);
  }

  if (!node.selectionSet) {
    // Build leaf node
    let { name: { value: name } } = node;
    let field = type.getFields()[name];
    let newPath = path === '' ? `${name}` : `${path}.${name}`;
    return reduceFieldAndSelections(builder, { field, selections: [], args: {} }, newPath);
  }
  else if (node.selectionSet) {
    // Build nested node
    let { name: { value: name } } = node;
    let newPath = path === '' ? `${name}` : `${path}.${name}`;
    let field = type.getFields()[name];
    return reduceFieldAndSelections(builder, { field, selections: <Array<FieldNode>>node.selectionSet.selections, args: {} }, newPath)
      .Back(`${path}.id`);
  }
}
