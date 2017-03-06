import cayley = require('node-cayley');

import {
  CAYLEY_ADDRESS,
  MAG_API_ENDPOINT
} from '../config';

import * as Context from './context';

const client = cayley(CAYLEY_ADDRESS);
const graph = client.g;

// type ContextKey =
type Morphism = any;

// type Type<T> =

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
  // .Tag(`${key}_id`);
