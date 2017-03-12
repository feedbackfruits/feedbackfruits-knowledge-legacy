export const type = "<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>";
export const name = "<http://schema.org/name>";
export const image = "<http://schema.org/image>";
export const description = "<http://schema.org/description>";
export const text = "<http://schema.org/text>";
export const url = "<http://schema.org/url>";
export const sameAs = "<http://schema.org/sameAs>";
export const author = "<http://schema.org/author>";
export const citation = "<http://schema.org/citation>";
export const CreativeWork = "<http://schema.org/CreativeWork>";
export const Person = "<http://schema.org/Person>";
export const ReadAction = "<http://schema.org/ReadAction>";
export const WriteAction = "<http://schema.org/WriteAction>";
export const FieldOfStudy = "<http://academic.microsoft.com/FieldOfStudy>";
export const parentFieldOfStudy = "<http://academic.microsoft.com/parentFieldOfStudy>";
export const childFieldOfStudy = "<http://academic.microsoft.com/childFieldOfStudy>";

export module GraphQL {
  export const ID = "id";
  export const NAME = {"name":"<http://schema.org/name>"};
  export const DESCRIPTION = {description: "<http://schema.org/description>"};
  export const IMAGE = {image: "<http://schema.org/image>"};
}
