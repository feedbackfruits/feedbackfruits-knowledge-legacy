import * as Config from '../config';
import Elasticsearch from './elasticsearch';

export async function autocomplete(text) {
  const query = {
    size: 5,
    _source: 'name',
    query: {
       function_score: {
        query: {
          multi_match: {
            query: text,
            fields: [ 'name' ]
          }
        },
        field_value_factor: {
          field: 'count'
        }
      }
    }
  };

  // console.log('Autocomplete query:', JSON.stringify(query));

  const results = await Elasticsearch(Config.ELASTICSEARCH_INDEX_NAME, 'entity', JSON.stringify(query), 0, 5);
  return results;
}

export async function search(entities, page, perPage) {
  console.log('Searching for entities:', entities);
  const from = ((page || 0) - 1) * perPage;
  const size = perPage;

  const entityNames = entities.map(uri => uri.replace(/(https:\/\/en\.wikipedia\.org\/wiki\/|http:\/\/dbpedia\.org\/resource\/)/, '').replace(/_/g, ' '));
  const metadataQueries = entityNames.reduce((memo, name) => {
    return [
      ...memo,
      {
        match: {
          name: {
            query: name,
            operator: 'and',
            boost: 2
          }
        }
      },
      {
        match: {
          description: {
            query: name,
            operator: 'and',
          }
        }
      }
    ];
  }, []);

  const query = {
    from,
    size,
    query: {
      bool: {
        must: [
          // This filters by organzation(s)
          {
            terms : {
              sourceOrganization: Config.SEARCH_ORGANIZATIONS
            }
          },
          {
            bool: {
              should: [
                // This finds resources by tags and annotations. Some notes:
                // - Tags and annotations are treated equally at the moment
                // - Tags and annotations are scored linearly weighed by their score from LTE/NER
                // - Scoring is based on the average of the child scores, so as to not bias longer resources vs shorter ones
                {
                  has_child: {
                    type: "Tag",
                    score_mode : "avg",
                    query: {
                       function_score: {
                        query: {
                          terms: {
                            about: entities
                          }
                        },
                        field_value_factor: {
                          field: 'score'
                        }
                      }
                    }
                  }
                },
                {
                  has_child: {
                    type: "Annotation",
                    score_mode : "avg",
                    query: {
                       function_score: {
                        query: {
                          terms: {
                            about: entities
                          }
                        },
                        field_value_factor: {
                          field: 'score'
                        }
                      }
                    }
                  }
                },

                // This allows resources to be found if the entityName occurs in the title or description of the resource
                {
                  bool: {
                    should: metadataQueries,
                    boost: 0.2
                  }
                }

              ]
            }
          },


        ]
      }
    }
  };

  const searchResults = await Elasticsearch('resources', 'Resource', JSON.stringify(query), from, size)
  const totalPages = Math.ceil(searchResults.meta.total / perPage);

  return {
    meta: {
      page,
      perPage: perPage,
      totalPages,
      totalResults: searchResults.meta.total
    },
    results: searchResults.results.map(result => ({
      score: result._score,
      ...result._source,
    }))
  };
}
