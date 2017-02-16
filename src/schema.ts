import {
  graphql,
  GraphQLSchema,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import fetch from 'node-fetch';
import cayley from './cayley';
const PQueue = require('p-queue');

import Config from './config';

const {
  DBPEDIA_ENDPOINT
} = Config;

interface FieldOfStudy {
  name: string,
  description: string,
  parents: FieldOfStudy[],
  children: FieldOfStudy[]
}

const queue = new PQueue({
  concurrency: 4
});

var dbpediaContext = {
  label: 'http://www.w3.org/2000/01/rdf-schema#label',
  abstract: 'http://dbpedia.org/ontology/abstract'
};

function getDBPediaEntity(url) {
  console.log(`Fetching ${url}`);
  return fetch(url, {
    headers: {
      Accept: 'application/ld+json'
    }
  }).then(response => response.text()) //.then(json => json['@graph'][0])
  .then(text => {
    return new Promise((resolve, reject) => {
      try {
        const res = JSON.parse(text)['@graph'][0];
        return resolve(res);
      } catch(e) {
        console.log(text);
        reject(e);
      }
    });
  })
  .catch(err => { console.error(err);throw err });
}

function findEnglishValue(values) {
  return values.find(value => {
    return value['@language'] === 'en';
  })['@value'];
}

const FieldOfStudyType = new GraphQLObjectType({
  name: 'FieldOfStudyType',
  fields: () => ({
    id: {
      type: GraphQLString,
      resolve(source, args, context, info) {
        return source['@id'];
      }
    },
    name: {
      type: GraphQLString,
      resolve(source, args, context, info) {
        return findEnglishValue(source[dbpediaContext.label]);
      }
    },
    description: {
      type: GraphQLString,
      resolve(source, args, context, info) {
        return findEnglishValue(source[dbpediaContext.abstract]);
      }
    },
    parents: {
      type: new GraphQLList(FieldOfStudyType),
      resolve(source, args, context, info) {
        const id = source['@id'];
        return cayley.getParents(id).then(parents => {
          const urls = parents.map(parent => parent.id.slice(1, parent.id.length - 1));
          return urls.reduce((memo, value) => {
            return queue.add(() => getDBPediaEntity(value));
          }, queue.add(() => Promise.resolve()));
        });
      }
    },
    children: {
      type: new GraphQLList(FieldOfStudyType),
      resolve(source, args, context, info) {
        const id = source['@id'];
        return cayley.getChildren(id).then(children => {
          const urls = children.map(child => child.id.slice(1, child.id.length - 1));
          return urls.reduce((memo, value) => {
            return queue.add(() => getDBPediaEntity(value));
          }, queue.add(() => Promise.resolve()));
          // return Promise.all(urls.map(getDBPediaEntity));
        });
      }
    },
    raw: {
      type: GraphQLString,
      resolve(source, args, context, info) {
        return JSON.stringify(source);
      }
    }
  })
});

// const ResourceType = new GraphQLObjectType({
//   name: 'ResourceType',
//   fields: () => ({
//     id: {
//       type: GraphQLString,
//       resolve(source, args, context, info) {
//         return source.id;
//       }
//     },
//     type: {
//       type: GraphQLString,
//       resolve(source, args, context, info) {
//         return source.type;
//       }
//     },
//     data: {
//       type: GraphQLString,
//       resolve(source, args, context, info) {
//         return source;
//       }
//     }
//   })
// });

const Schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      field: {
        type: FieldOfStudyType,
        args: {
          id: {
            type: GraphQLString,
          }
        },
        resolve(source, { id } , context, info) {
          const url = `${DBPEDIA_ENDPOINT}${id}`;
          return getDBPediaEntity(url);
          // return cayley.get(id);
        }
      }
    }
  })
});

export default Schema;
