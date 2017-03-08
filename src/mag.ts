import fetch from './helpers/fetch';

import {
  MAG_API_ENDPOINT,
  MAG_API_KEY
} from './config';

import { TopicId, TopicReference, Topic } from './topic';

export type MagId = string;
export type MagEvaluateEntity = {
  Id: string;
}
export type MagEvaluateResult = {
  entities: Array<MagEvaluateEntity>
}
export type MagFieldOfStudyRef = {
  id: number,
  lt: string
}
export type MagEntity = {
  entityTitle: string,
  description: string,
  image: string,
  parentFieldsOfStudy: Array<MagFieldOfStudyRef>,
  childFieldsOfStudy: Array<MagFieldOfStudyRef>
};

function normalizeName(name) {
  return name.toLowerCase().replace(/[\W]/g, ' ').replace(/ +/g, ' ').trim();
}

export function findEntityId(name: string): Promise<MagId> {
  const label = normalizeName(name);

  const expression = encodeURIComponent(`FN='${label}'`);
  const url = `https://westus.api.cognitive.microsoft.com/academic/v1.0/evaluate?expr=${expression}&attributes=Id,&subscription-key=${MAG_API_KEY}`

  return fetch(url).then(response => response.json<MagEvaluateResult>()).then(result => {
    if (!result.entities || !result.entities.length) throw new Error(`Cannot find entity with name ${name}`);
    return result.entities[0].Id;
  });
}


export function getMagEntity(id: MagId): Promise<MagEntity> {
  const url = `${MAG_API_ENDPOINT}?entityId=${id}&correlationId=1`;

  return fetch(url).then(response => response.json<MagEntity>()).then(result => {
    // console.log(result);
    return result;
  });
}

export function findEntity(name: TopicId): Promise<MagEntity> {
  return findEntityId(name).then(getMagEntity);
}


// export function toTopic(entity: MagEntity): Topic {
//   const {
//     entityTitle: name,
//     description,
//     image: thumbnail,
//     parentFieldsOfStudy,
//     childFieldsOfStudy
//   } = entity;
//
//   const parents: Array<TopicReference | Topic > = parentFieldsOfStudy ? parentFieldsOfStudy.map(field => ({ id: field.lt })) : [];
//   const children: Array<TopicReference | Topic > = childFieldsOfStudy ? childFieldsOfStudy.map(field => ({ id: field.lt })) : [];
//
//   return {
//     id: normalizeName(name),
//     name,
//     description,
//     thumbnail,
//     parents,
//     children
//   };
// }

export default {
  findEntity,
  // toTopic
}
