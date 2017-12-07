const predicateMap: { [key: string]: CayleyGraphQLPredicate } = {
  // 'http://www.w3.org/2002/07/owl#sameAs': 'http://schema.org/sameAs',
  'https://knowledge.express/entity': { iri: 'http://schema.org/sameAs', reverse: false },
  'https://knowledge.express/fieldOfStudy': { iri: 'http://schema.org/sameAs', reverse: true },

  'https://knowledge.express/about': { iri: 'http://schema.org/about', reverse: false },
  'https://knowledge.express/subjectOf': { iri: 'http://schema.org/subjectOf', reverse: false },
};

export type CayleyGraphQLPredicate = { iri: string, reverse: boolean };

// This maps predicates defined in the ontology to the predicates used in the database.
// This hack is needed until semantic-graphql is able to follow subPropertyOf paths through the resolvers
export function mapPredicate(iri: string): CayleyGraphQLPredicate {
  if (iri in predicateMap) return predicateMap[iri];
  return { iri, reverse: false };
}
