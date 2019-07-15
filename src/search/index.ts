import * as Config from '../config';
import Elasticsearch from './elasticsearch';

export async function autocomplete(text) {
  try {
    const query = {
      size: 10,
      _source: 'name',
      query: {
        bool: {
          must: [
            {
              function_score: {
                  query: {
                    multi_match: {
                      query: text,
                      fields: [ 'name' ],
                      operator: 'and',
                      analyzer: 'edge_ngram_analyzer'
                    },
                  },
              }
            }
          ],
          should: [
            {
              function_score: {
                query: {
                  match: {
                    name: {
                      query: text,
                      operator: 'and'
                    }
                  },
                },
                field_value_factor: {
                  field: 'resourceCount',
                  factor: '0.5',
                  modifier: 'ln1p'
                }
              }
            }
          ]
        }
      }
    };

    // console.log('Autocomplete query:', JSON.stringify(query));

    const results = await Elasticsearch(Config.ELASTICSEARCH_AUTOCOMPLETE_INDEX, 'Entity', JSON.stringify(query), 0, 10);
    const deduplicated = Object.values(results.results.reduce((memo, suggestion) => {
      const key = suggestion._source["name"];

      if (key in memo) memo[key] = {
        ...memo[key],
        _score: memo[key]._score + suggestion._score
      }
      else memo[key] = {
        ...suggestion
      };

      return memo;
    },{})).sort((a, b) => {
      return b["_score"] - a["_score"];
    }).slice(0, 5);

    return {
      ...results,
      results: deduplicated
    };
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
