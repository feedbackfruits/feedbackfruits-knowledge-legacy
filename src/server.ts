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
import * as Search from './search';

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

  server.get("/autocomplete", async (req, res) => {
    try {
      const { text } = req.query;
      if (!text || text == '') return res.json([]);
      const results = await Search.autocomplete(text);
      res.json(results).end();
    } catch(err) {
      res.status(500).json(err).end();
    }
  });

  server.get("/search", async (req, res, next) => {
    try {
      const { entities = [], page = 1, pageSize = 10 } = req.query;
      const results = await Search.search(entities, page, pageSize);

      res.json(results).end();
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
