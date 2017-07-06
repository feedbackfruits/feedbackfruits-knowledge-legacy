import * as cors from "cors";
import * as express from "express";
import * as graphqlHTTP from "express-graphql";
import * as morgan from "morgan";

import Schema from "./schema";

import Elasticsearch from "./elasticsearch";
import { search } from "./search";

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
    Elasticsearch(query).then(results => {
      res.json(results).end();
    }).catch(err => res.status(500).json(err).end());
  });

  server.get("/search", async (req, res, next) => {
    const { entities } = req.query;
    return search(entities || [])
      .then(results => {
        res.json({ results }).end();
      }).catch(next);
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
