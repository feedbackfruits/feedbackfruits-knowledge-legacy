require('dotenv').load({ silent: true });

const {
  CAYLEY_ADDRESS = 'http://cayley:64210'
} = process.env;

import fetch from 'node-fetch';
import cayley = require('node-cayley');

import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

const client = cayley(CAYLEY_ADDRESS, {
  promisify: true
});

const graph = client.g;

// Default to 'query'.
Promise.resolve(graph
  .V("<http://dbpedia.org/resource/Anthropology>")
  .Out("<http://schema.org/sameAs>")
  .Out("<http://academic.microsoft.com/parentFieldOfStudy>")
  .In("<http://schema.org/sameAs>")
  .All()).then(res => {
    debugger;
    console.log(res);
    // Your data in JSON.
  }).catch((err) => {
    // Error ...
  });

console.log('hi');

type Field = {
  children: Array<Field>,
  parents: Array<Field>
};

const MAG_API_ENDPOINT = 'https://academic.microsoft.com/api/browse/GetEntityDetails';
const DBPEDIA_ENDPOINT = 'http://dbpedia.org/resource/'


function get(id) {
  const url = `${MAG_API_ENDPOINT}?entityId=${id}&correlationId=1`;
  return fetch(url).then(response => response.json());
};


const FieldType = new GraphQLObjectType({
  name: 'FieldType',
  fields: () => ({
    parents: {
      type: FieldType,
      resolve(source, args, context, info) {
        const { id } = args;

        // get()

        return { source, args, context, info };
      }
    },
    children: {
      type: FieldType,
      resolve(source, args, context, info) {
        return { source, args, context, info };
      }
    }
  })
});

var schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      get: {
        type: GraphQLString,
        args: {
          id: {
            type: GraphQLString,
          }
        },
        resolve(source, { id } , context, info) {
          return id;
        }
      }
    }
  })
});


// type DBPediaEntity = Entity;

export default {

}
