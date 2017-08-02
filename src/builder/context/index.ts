export * from "feedbackfruits-knowledge-context";

import {
  name,
  type,
  description,
  image,
  license,
  sourceOrganization,
  sameAs,
  DBPedia
} from "feedbackfruits-knowledge-context"

export module GraphQL {
  export const ID = "id";
  export const NAME = { name: `${name} @opt` };
  export const TYPE = { type: `${type} @opt` };
  export const DESCRIPTION = { description: `${description} @opt` };
  export const IMAGE = { image: `${image} @opt` };
  export const LICENSE = { license: `${license} @opt` };
  export const SOURCE_ORGANIZATION = { sourceOrganization: `${sourceOrganization} @opt` };
  export const SAME_AS = { sameAs: `${sameAs} @opt` };
}

export module SparQL {
  export const ID = "id";
  export const NAME = { name: DBPedia.label };
  export const DESCRIPTION = { description: DBPedia.abstract };
  export const IMAGE = { image: DBPedia.thumbnail };
}
