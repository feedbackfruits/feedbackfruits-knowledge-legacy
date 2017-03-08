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


export function mapTypeAndSelections<TBuilder>(type: BuilderObjectType<TBuilder>, selections: FieldNode[]) {
  let fields = type.getFields()
  return selections.map(s => {
    let field = fields[s.name.value];
    let args = s.arguments.reduce((memo, arg: ArgumentNode) => {
      let { name: { value: name } } = arg;
      let { value } = (<StringValueNode>arg.value);
      memo[name] = value;
      return memo;
    }, {});
    return {
      field,
      selections: s.selectionSet ? <Array<FieldNode>>s.selectionSet.selections : null,
      args
    };
  });
}

export function reduceFieldAndSelections<TBuilder>(builder, { field, selections, args }, path) {
  let type = field.type instanceof GraphQLList ? field.type.ofType : field.type;
  // let { name: { value: name } } = field;
  // let newPath = path === '' ? `${name}` : `${path}.${name}`;
  console.log(`Building field:`, path);
  let newBuilder = field.build(builder, args, path);
  // let newBuilder = build(field, type, builder, path);
  return selections.reduce((b, s) => {
    // let { name: { value: name } } = s;
    // let newPath = path === '' ? `${name}` : `${path}.${name}`;
    console.log(`Building selection:`, path);
    return build(s, <BuilderObjectType<TBuilder>>type, b, path);
  }, newBuilder);
}

export function build<TBuilder>(node: FieldNode | OperationDefinitionNode, type: BuilderObjectType<TBuilder>, builder: TBuilder, path = ''): TBuilder {
  if (node.kind === 'OperationDefinition') {
    // This makes sure the graph traversal is initiated properly
    console.log('Starting build on operation definition node:', path);
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
    console.log(`Adding leaf node ${newPath} to build.`);
    // return field.build(builder, args, newPath);
    return reduceFieldAndSelections(builder, { field, selections: [], args: {} }, newPath);
  }
  else if (node.selectionSet) {
    // Build nested node
    let { name: { value: name } } = node;
    let newPath = path === '' ? `${name}` : `${path}.${name}`;
    console.log(`Adding ${newPath} to build.`);
    // debugger;
    let field = type.getFields()[name];
    // let newBuilder = field.build(builder, args, newPath);
    return reduceFieldAndSelections(builder, { field, selections: <Array<FieldNode>>node.selectionSet.selections, args: {} }, newPath)
      .Back(`${path}.id`);
    // let fieldMap = mapTypeAndSelections(type, <Array<FieldNode>>node.selectionSet.selections);
    // return fieldMap.reduce((builder, fieldMap) => {
    //   // return build(selection, <BuilderObjectType<TBuilder>>type, builder, newPath);
    //   return reduceFieldAndSelections(builder, fieldMap, newPath);
    // }, builder);

    // return newBuilder;
    // return fieldMap.reduce((builder, fieldMap) => {
    //   debugger;
    //   let type = field.type instanceof GraphQLList ? field.type.ofType : field.type;
    //   if (!selections) return build(<any>field, type, builder, newPath);
    //   else return selections.reduce((builder, selection) => {
    //     return build(selection, <BuilderObjectType<TBuilder>>type, builder, path);
    //   }, builder);
      // if (!selections) return field.build(builder, args, newPath);
      // return reduceFieldAndSelections(builder, fieldMap, newPath);
    // }, newBuilder);

    // return reduceFieldAndSelections(builder, <any>fieldMap, path);
    // let newBuilder = fieldMap.reduce((builder, fieldMap) => {
      // let type = field.type instanceof GraphQLList ? field.type.ofType : field.type;
      // // let newBuilder = field.build(builder, args, path === '' ? `${name}` : `${path}.${name}`);
      // return selections.reduce((b, s) => {
      //   return build(s, <BuilderObjectType<TBuilder>>type, b);
      // }, builder);

    // }, builder);

    // return newBuilder;
  } else {
    // debugger;
    // let { name: { value: name } } = node;
    // let field = type.getFields()[name];
    // console.log(`Adding ${name} to build.`);
    // return field.build(builder, args, path === '' ? `${name}` : `${path}.${name}`);
  }

  // return builder;
}
