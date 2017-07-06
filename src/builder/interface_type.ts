import {
  GraphQLInterfaceType,
} from "graphql";

import { BuilderType, IBuilderInterfaceTypeConfig } from "./index";

export class BuilderInterfaceType<TBuilder> extends GraphQLInterfaceType {
  public builderType: BuilderType;

  constructor(config: IBuilderInterfaceTypeConfig<any, any, TBuilder>) {
    super(config);
    this.builderType = config.builderType;
  }
}
