import cors from "cors";
import express from "express";
import morgan from "morgan";
import bodyParser from 'body-parser';
import { createServer } from 'http';

import { ApolloServer } from 'apollo-server-express';
import { SubscriptionServer } from 'subscriptions-transport-ws';
// import { prepareSchema } from 'graphql-rxjs';

import * as Config from './config';
import { getSchema } from "./schema";
import * as Search from './search';
import * as Traverse from './traverse';
// import traverse from './traverse-graph';

export async function create() {
  try {
    const server = express();

    // console.log('Server.use:', server.use);
    const schema = await getSchema();

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

    server.get('/traverse', async (req, res, next) => {
      try {
        const { entities = [], resources = [] } = req.query;
        // console.log('Traversing entities:', entities);
        const result = await Traverse.traverse(schema as any, resources);
        // console.log('Traversal result:', result);
        res.json(result).end();
      } catch(err) {
        console.error('Traversal broke...');
        console.error(err);
        res.status(500).json(err).end();
      }
    });

    server.all("/", bodyParser.json(), (req, res, next) => {
      if (req.method.toUpperCase() === 'POST' && typeof req.body === 'object' && Object.keys(req.body).length === 0) return next(new Error('POST body cannot be an empty object.'));
      next();
    });

    const apolloServer = new ApolloServer({ schema: schema });

    apolloServer.applyMiddleware({ app: server, path: '/' });

    server.use((error, req, res, next) => {
      console.log('Error handler triggering...')
      if (error instanceof Error) {
        // tslint:disable-next-line no-console
        console.error(error);
        res.status(400).json({ error: error.toString() }).end();
      }
    });

    return createServer(server);

  } catch(e) {
    console.error('Error:', e);
  }
}

export default {
  create
};
