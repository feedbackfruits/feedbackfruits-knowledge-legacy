import * as Config from '../config';
import Elasticsearch from './elasticsearch';

export async function autocomplete(text) {
  try {
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
            field: 'resourceCount'
          }
        }
      }
    };

    // console.log('Autocomplete query:', JSON.stringify(query));

    const results = await Elasticsearch(Config.ELASTICSEARCH_AUTOCOMPLETE_INDEX, 'Entity', JSON.stringify(query), 0, 5);
    return results;
  } catch(e) {
    console.error(e);
    throw e;
  }
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

                {
                  nested: {
                    path: "about",
                    query: {
                      function_score: {
                        query: {
                          terms: {
                            "about.id": entities
                          }
                        },
                        field_value_factor: {
                          field: 'about.score',
                        },
                        score_mode: 'sum'
                      }
                    },
                    score_mode: "sum"
                  }
                }
              ]
            }
          },


        ]
      }
    }
  };
  const searchResults = await Elasticsearch(Config.ELASTICSEARCH_SEARCH_INDEX, 'Resource', JSON.stringify(query), from, size)
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
