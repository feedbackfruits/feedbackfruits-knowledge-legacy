import {
  GraphQLFieldMap,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  Thunk
} from "graphql";

import { BuilderType, IBuilderField, IBuilderFieldConfigMap } from "./index";

export type BuilderFn<TBuilder> = (builder: TBuilder, args: { [argName: string]: any }, path?: string[]) => TBuilder;

export class BuilderObjectType<TBuilder> extends GraphQLObjectType {
  public builderType: BuilderType;

  constructor(config: IBuilderObjectTypeConfig<any, any, TBuilder>) {
    super(config);
    this.builderType = config.builderType;
  }

  public getFields(): IBuilderFieldMap<any, any, TBuilder> {
    return super.getFields() as IBuilderFieldMap<any, any, TBuilder>;
  }
}

export interface IBuilderObjectTypeConfig<TSource, TContext, TBuilder> extends GraphQLObjectTypeConfig<TSource, TContext> {
  builderType?: BuilderType;
  fields: Thunk<IBuilderFieldConfigMap<TSource, TContext, TBuilder>>;
}

export interface IBuilderFieldMap<TSource, TContext, TBuilder> extends GraphQLFieldMap<TSource, TContext> {
  [fieldName: string]: IBuilderField<TSource, TContext, TBuilder>;
}
