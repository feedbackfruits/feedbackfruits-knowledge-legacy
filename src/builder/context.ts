export const type = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>';
export const name = '<http://schema.org/name>';
export const image = '<http://schema.org/image>';
export const description = '<http://schema.org/description>';
export const text = '<http://schema.org/text>';
export const url = '<http://schema.org/url>';
export const sameAs = '<http://schema.org/sameAs>';
export const license = '<http://schema.org/license>';
export const author = '<http://schema.org/author>';
export const about = '<http://schema.org/about>';
export const citation = '<http://schema.org/citation>';
export const CreativeWork = '<http://schema.org/CreativeWork>';
export const Person = '<http://schema.org/Person>';
export const ReadAction = '<http://schema.org/ReadAction>';
export const WriteAction = '<http://schema.org/WriteAction>';

export module Knowledge {
  export const Topic = '<https://knowledge.express/Topic>';
  export const next = '<https://knowledge.express/next>';
  export const previous = '<https://knowledge.express/previous>';
  export const child = '<https://knowledge.express/child>';
  export const parent = '<https://knowledge.express/parent>';
  export const resource = '<https://knowledge.express/resource>';

  export const Resource = '<https://knowledge.express/Resource>';
  export const topic = '<https://knowledge.express/topic>';
  export const entity = '<https://knowledge.express/entity>';

  export const Entity = '<https://knowledge.express/Entity>';
}

export module DBPedia {
  export const label = 'http://www.w3.org/2000/01/rdf-schema#label';
  export const abstract = 'http://dbpedia.org/ontology/abstract';
  export const thumbnail = 'http://xmlns.com/foaf/0.1/depiction';
  export const redirects = 'http://dbpedia.org/ontology/wikiPageRedirects';
}

export module GraphQL {
  export const ID = 'id';
  export const NAME = { name: `${name} @opt` };
  export const DESCRIPTION = { description: `${description} @opt` };
  export const IMAGE = { image: `${image} @opt` };
  export const LICENSE = { license: `${license} @opt` };
  export const SAME_AS = { sameAs: `${sameAs} @opt` };
}

export module SparQL {
  export const ID = 'id';
  export const NAME = { name: DBPedia.label };
  export const DESCRIPTION = { description: DBPedia.abstract };
  export const IMAGE = { image: DBPedia.thumbnail };
}

export module KhanAcademy {
  export const Topic = '<https://www.khanacademy.org/Topic>';
  export const childTopic = '<https://www.khanacademy.org/childTopic>';
  export const parentTopic = '<https://www.khanacademy.org/parentTopic>';
}

export module AcademicGraph {
  export const FieldOfStudy = '<http://academic.microsoft.com/FieldOfStudy>';
  export const parentFieldOfStudy = '<http://academic.microsoft.com/parentFieldOfStudy>';
  export const childFieldOfStudy = '<http://academic.microsoft.com/childFieldOfStudy>';
}
