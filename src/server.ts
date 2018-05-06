import * as cors from "cors";
import * as express from "express";
import * as accepts from "express-accepts";
import * as graphqlHTTP from "express-graphql";
import * as morgan from "morgan";
import * as bodyParser from 'body-parser';
import { createServer } from 'http';

import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { prepareSchema } from 'graphql-rxjs';

import * as Config from './config';
import { getSchema } from "./schema";
import Elasticsearch from "./elasticsearch";

export async function create() {
  const server = express();

  // Add morgan for logging
  server.use(morgan("combined"));

  // Allow CORS
  server.use(cors({
    origin: true,
    credentials: true
  }));

  // Disable favicon
  server.get("/favicon.ico", (req, res, next) => res.status(404).end());

  server.get("/autocomplete", (req, res) => {
    const { text } = req.query;
    if (!text || text == '') return res.json([]);

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

    Elasticsearch(Config.ELASTICSEARCH_INDEX_NAME, 'entity', JSON.stringify(query), 0, 5).then(results => {
      res.json(results).end();
    }).catch(err => res.status(500).json(err).end());
  });

  server.get("/search", async (req, res, next) => {
    try {
      const { entities = [], page = 1, pageSize = 10 } = req.query;
      console.log('Searching for entities:', entities);
      const from = ((page || 0) - 1) * pageSize;
      const size = pageSize;

      const entityNames = entities.map(uri => uri.replace(/(https:\/\/en\.wikipedia\.org\/wiki\/|http:\/\/dbpedia\.org\/resource\/)/, '').replace(/_/g, ' '));
      const metadataQueries = entityNames.reduce((memo, name) => {
        return [
          ...memo,
          {
            match: {
              name: {
                query: name,
                boost: 2
              }
            }
          },
          {
            match: {
              description: name
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
      const totalPages = Math.ceil(searchResults.meta.total / pageSize);

      res.json({
        meta: {
          page,
          pageSize,
          totalPages,
          totalResults: searchResults.meta.total
        },
        results: searchResults.results.map(result => ({
          score: result._score,
          ...result._source,
        }))
      }).end();
    } catch(err) {
      res.status(500).json(err).end();
    }
  });

  const schema = prepareSchema(await getSchema());

  server.all('/', accepts('text/html', 'application/json'));
  server.all('/', accepts.on('text/html'), graphiqlExpress({
    endpointURL: Config.HOST,
    subscriptionsEndpoint: Config.HOST
  }));

  server.all("/", bodyParser.json(), (req, res, next) => {
    if (typeof req.body === 'object' && Object.keys(req.body).length === 0) return next(new Error('POST body cannot be an empty object.'));
    next();
  }, graphqlExpress(<any>{
    schema,
    // graphiql: true
  }));

  server.use((error, req, res, next) => {
    if (error instanceof Error) {
      // tslint:disable-next-line no-console
      console.error(error);
      res.status(400).json({ error: error.toString() }).end();
    }
  });

  return createServer(server);
}

export default {
  create
};
