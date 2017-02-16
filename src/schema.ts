import {
  graphql,
  GraphQLSchema,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import fetch from 'node-fetch';
import * as qs from 'qs';
import PQueue = require('p-queue');

import graph from './graph';
import { DBPEDIA_ENDPOINT } from './config';
import { getEntity } from './dbpedia';

interface FieldOfStudy {
  name: string,
  description: string,
  parents: FieldOfStudy[],
  children: FieldOfStudy[]
}

const queue = new PQueue({
  concurrency: 4
});

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
        return source['name'];
      }
    },
    description: {
      type: GraphQLString,
      resolve(source, args, context, info) {
        return source['description']
      }
    },
    thumbnail: {
      type: GraphQLString,
      resolve(source, args, context, info) {
        return source['thumbnail']
      }
    },
    parents: {
      type: new GraphQLList(FieldOfStudyType),
      resolve(source, args, context, info) {
        const id = source['id'];
        return graph.getParents(id).then(parents => {
          const urls = parents.map(parent => parent.id.slice(1, parent.id.length - 1));

          return Promise.all(urls.map(value => {
            return queue.add(() => getEntity(value)).catch(() => null);
          })).then(results => results.filter(x => x));
        });
      }
    },
    children: {
      type: new GraphQLList(FieldOfStudyType),
      resolve(source, args, context, info) {
        const id = source['id'];
        return graph.getChildren(id).then(children => {
          const urls = children.map(child => child.id.slice(1, child.id.length - 1));

          return Promise.all(urls.map(value => {
            return queue.add(() => getEntity(value)).catch(() => null);
          })).then(results => results.filter(x => x));
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
          return getEntity(url);
        }
      }
    }
  })
});

export default Schema;
