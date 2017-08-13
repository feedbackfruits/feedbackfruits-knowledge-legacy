import * as cors from "cors";
import * as express from "express";
import * as graphqlHTTP from "express-graphql";
import * as morgan from "morgan";

import Schema from "./schema";

import Elasticsearch from "./elasticsearch";

export function create() {
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
    const query = `{
    "size": 5,
    "_source": "name",
    "query": {
         "function_score": {
          "query": {
            "multi_match": {
              "query":    "${text}",
              "fields": [ "name" ]
            }
          },
          "field_value_factor": {
            "field": "count"
          }
        }
    }
}`;
    Elasticsearch('entity', query).then(results => {
      res.json(results).end();
    }).catch(err => res.status(500).json(err).end());
  });

  server.get("/search", (req, res) => {
    const { entities = [], page = 1, pageSize = 10 } = req.query;
    console.log('Searching for entities:', entities);
    const from = ((page || 0) - 1) * pageSize;
    const size = pageSize;

    const query = `{
    "from": ${from},
    "size": ${size},
    "_source": "entities.id",
    "_source": [
      "id",
      "type",
      "name",
      "description",
      "entities",
      "license",
      "sourceOrganization"
    ],
    "query": {
        "terms": {
           "entities.id": ${JSON.stringify(entities)}
        }
    }
}`;
    Elasticsearch('resource', query).then((results: any) => {
      res.json({
        results: results.map(result => ({
          score: result._score,
          ...result._source,
        }))
      }).end();
    }).catch(err => res.status(500).json(err).end());
  });

  server.all("/", graphqlHTTP({
    schema: Schema,
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
