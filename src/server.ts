import * as express from 'express';
import * as morgan from 'morgan';
import * as cors   from 'cors';
import * as graphqlHTTP from 'express-graphql';

import Schema from './schema';

import Elasticsearch from './elasticsearch';

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

  server.get('/autocomplete', (req, res) => {
    let { text } = req.query;
    let query = `{
      "size": 5,
      "_source": "name",
      "query": {
        "match": {
          "name": "${text}"
        }
      }
    }`;
    Elasticsearch(query).then(results => {
      res.json(results).end();
    }).catch(err => res.status(500).json(err).end());
  });

  server.all('/', graphqlHTTP({
    schema: Schema,
    graphiql: true
  }));

  return server;
}

export default {
  create
};
