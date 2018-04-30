import * as cors from "cors";
import * as express from "express";
import * as graphqlHTTP from "express-graphql";
import * as morgan from "morgan";
import * as Config from './config';

// import Schema from "./schema";
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

  server.get("/search", async (req, res) => {
    const { entities = [], page = 1, pageSize = 10 } = req.query;
    console.log('Searching for entities:', entities);
    const from = ((page || 0) - 1) * pageSize;
    const size = pageSize;

    const query = {
      from,
      size,
      query: {
        has_child: {
          type: "Tag",
          score_mode : "sum",
          query: {
            bool: {
              must: [
                {
                  terms: {
                    about: entities
                  }
                },
                // {
                //   terms : {
                //     sourceOrganization : Config.SEARCH_ORGANIZATIONS
                //   }
                // }
              ]
            }
          }
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
  });

  server.all("/", graphqlHTTP({
    schema: await getSchema(),
    graphiql: true
  }));

  server.use((error, req, res, next) => {
    if (error instanceof Error) {
      // tslint:disable-next-line no-console
      console.error(error);
      res.status(400).json({ error: error.toString() }).end();
    }
  });

  return server;
}

export default {
  create
};
