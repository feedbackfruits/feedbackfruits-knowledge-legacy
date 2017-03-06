import fetch from 'node-fetch';
import cayley = require('cayley-node');

import {
  CAYLEY_ADDRESS,
  MAG_API_ENDPOINT
} from '../config';

import { Topic } from '../topic';

import * as Context from './context';
// import * as Morphisms from './morphisms';

const client = cayley(CAYLEY_ADDRESS);
export const graph = client.g;

export type DBPediaPointer = {
  id: string
}

// export function getEntityDetails(id) {
//   const url = `${MAG_API_ENDPOINT}?entityId=${id}&correlationId=1`;
//   return fetch(url).then(response => response.json());
// }

export type Entity = {
  id: string,
  name: string,
  description: string,
  image: string
};


function normalizeName(name) {
  return name.toLowerCase().replace(/[\W]/g, ' ').replace(/ +/g, ' ').trim();
}

module Morphisms {
  export const topic = (key: string = 'topic') => graph.M()
    .Save(Context.name, `${key}_name`)
    .Save(Context.image, `${key}_image`)
    .Tag(`${key}_id`)
    // .Save(Context.description, `${key}_description`)

  export const parents = (key: string = 'parent') => graph.M()
    .Out(Context.parentFieldOfStudy)
    // .Tag(`${key}_id`)

  export const children = (key: string = 'child') => graph.M()
    .Out(Context.childFieldOfStudy)
}

export function get(name): Promise<Array<Entity>> {
  let id = normalizeName(name);
  return new Promise((resolve, reject) => {
    graph
      .V(id)
      .In(Context.name)
      .Follow(Morphisms.topic())
      .Follow(Morphisms.children("topic_child"))
      .Follow(Morphisms.topic("topic_child"))
      .All((err, res) => {
        console.log('Graph get:', err, res);
        if (err) return reject(err);
        if ('error' in res) return reject(res.error);
        return resolve(parseResults(res.result));
      });
  });
}

function parseResults(results): Array<Entity> {
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

export function toTopic(entities: Array<Entity>): Topic {
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

export function getParents(id): Promise<DBPediaPointer[]> {
  console.log(`Getting parents for ${id}`);
  return new Promise((resolve, reject) => {
    graph
      .V(id)
      .Out(Context.name)
      .Out(Context.parentFieldOfStudy)
      .In(Context.name)
      .All((err, res) => {
        if (err) return reject(err);
        return resolve(res.result);
      });
  });

};

export function getChildren(id): Promise<DBPediaPointer[]> {
  console.log(`Getting children for ${id}`);
  return new Promise((resolve, reject) => {
    graph
      .V(id)
      .Out(Context.name)
      .Out(Context.childFieldOfStudy)
      .In(Context.name)
      .All((err, res) => {
        if (err) return reject(err);
        return resolve(res.result);
      });
  });

};

export default {
  get,
  getParents,
  getChildren,
  toTopic
}
