
import fetch from 'node-fetch';

import {
  MAG_API_ENDPOINT,
  MAG_API_KEY
} from './config';

import { DBPediaId } from './dbpedia';

type FieldOfStudyId = string;
type FieldOfStudy = {
  id: FieldOfStudyId,
  name: string,
  description: string,
  parents: FieldOfStudyId[],
  children: FieldOfStudyId[]
};

export type MagId = string;
export type MagEntity = {
  entityTitle: string,
  description: string
};


function normalizeName(name) {
  return name.toLowerCase().replace(/[^a-zA-Z0-9]/, ' ').replace(/ +/, ' ');
}


function nameToField(name: string): Promise<FieldOfStudy> {
  return findEntityId(name).then(getMagEntity).then(parseEntityToField);
}

export function findEntityId(name: string): Promise<MagId> {
  const label = name.toLowerCase();

  const expression = encodeURIComponent(`FN="${label}"`);
  const url = `https://westus.api.cognitive.microsoft.com/academic/v1.0/evaluate?expr=${expression}&attributes=Id,&subscription-key=${MAG_API_KEY}`

  return fetch(url).then(response => response.json()).then(result => {
    if (!result.entities.length) throw new Error(`Cannot find entity with name ${name}`);
    return result.entities[0].Id;
  });
}


export function getMagEntity(id: MagId): Promise<MagEntity> {
  const url = `${MAG_API_ENDPOINT}?entityId=${id}&correlationId=1`;

  return fetch(url).then(response => response.json()).then(result => {
    console.log(result);
    return result;
  });
}


function parseEntityToField(entity: MagEntity): FieldOfStudy {
  const {
    entityTitle: name,
    description
  } = entity;

  return {
    name,
    description
  };
}
