import * as express from 'express';
import * as morgan from 'morgan';
import * as cors   from 'cors';
import * as graphqlHTTP from 'express-graphql';

import Schema from './schema';
import spotlight = require('dbpedia-spotlight');


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

  server.all('/', graphqlHTTP({
    schema: Schema,
    graphiql: true
  }));

  server.get('/annotate', (req, res) => {
    const { text } = req.query;

    console.log(text);

    spotlight.annotate(text, output => {
      res.send(output);
    });
  });


  return server;
}

export default {
  create
};
