import * as express from 'express';
import * as morgan from 'morgan';
import * as cors   from 'cors';
import * as graphqlHTTP from 'express-graphql';

import Schema from './schema';

export function create() {
  const server = express();

  // Add morgan for logging
  server.use(morgan('combined'));

  // Allow CORS
  server.use(cors({
    origin: true,
    credentials: true
  }));

  // Disable favicon
  server.get('/favicon.ico', (req, res, next) => res.status(404).end());

  server.use('/', graphqlHTTP({
    schema: Schema,
    graphiql: true
  }));

  return server;
}

export default {
  create
};
