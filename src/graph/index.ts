import fetch from 'node-fetch';
import cayley = require('node-cayley');

import _unflatten from './unflatten';

import {
  CAYLEY_ADDRESS,
  MAG_API_ENDPOINT
} from '../config';

import * as Context from './context';

const client = cayley(CAYLEY_ADDRESS);
export const graph = client.g;

export type Entity = {
  id: string,
  name: string,
  description: string,
  image: string
};


function normalizeName(name) {
  return name.toLowerCase().replace(/[\W]/g, ' ').replace(/ +/g, ' ').trim();
}

export module Morphisms {
  export const topic = (key: string = 'topic') => graph.M()
    .Save(Context.name, `${key}_name`)
    .Save(Context.image, `${key}_image`)
    .Tag(`${key}_id`)

  export const parents = (key: string = 'parent') => graph.M()
    .Out(Context.parentFieldOfStudy)

  export const children = (key: string = 'child') => graph.M()
    .Out(Context.childFieldOfStudy)
}

export function parseResults(results): Array<Entity> {
  if (!results) throw new Error('No results.');
  let tree = results.reduce((memo, result) => {
    let keys = Object.keys(result);

    keys.forEach((key) => {
      let path = key.split('_');
      let [ id, property ] = path;
      let value = result[key];

      if (property == null) memo[id] = value;
      else if (!(id in memo)) memo[id] = { [property]: value };
      else  memo[id][property] = value;

    });

    return memo;
  }, {});

  return [ tree.topic ];
}

export function toTopic(entities: Array<Entity>): Object {
  console.log('Converting entity to topic:', entities);
  const {
    id,
    name,
    description,
    image: thumbnail
  } = entities[0];

  return {
    id,
    name,
    description,
    thumbnail,
    parents: [],
    children: []
  }
}

export const unflatten = _unflatten;
