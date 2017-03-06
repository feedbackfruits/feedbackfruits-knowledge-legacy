import { get as getEntity, toTopic} from './graph';
import PQueue = require('p-queue');

// import { get as getEntity } from './dbpedia';
// import { findEntity, toTopic } from './mag';

const queue = new PQueue({
  concurrency: 4
});

export type TopicId = string;
export type TopicReference = {
  id: TopicId
}
export type Topic = {
  id: TopicId,
  name: string,
  description: string,
  thumbnail: string,
  parents: Array<Topic>,
  children: Array<Topic>
};

export module Topic {
  export function get(id: TopicId): Promise<Topic> {
    return getEntity(id)
      .then(toTopic)
    // return findEntity(id).then(toTopic)
    // .then(topic => {
    //   // console.log(topic);
    //   return topic;
    // }).catch(err => {
    //   console.error(err);
    //   throw err;
    // });
  }

  export function getParents(topic: Topic): Promise<Array<Topic>> {
    return Promise.all(topic.parents.map(parent => get(parent.id)));
    // return Promise.resolve(topic.parents);
    // const id = topic['id'];
    // return graph.getParents(id).then(parents => {
    //   const urls = parents.map(parent => parent.id.slice(1, parent.id.length - 1));
    //
    //   return Promise.all(urls.map(value => {
    //     return queue.add(() => getEntity(value)).catch(() => null);
    //   })).then(results => results.filter(x => x));
    // });
  }

  export function getChildren(topic: Topic): Promise<Array<Topic>> {
    return Promise.all(topic.children.map(child => get(child.id)));
    // return Promise.resolve(topic.children);
    // const id = topic['id'];
    // return graph.getChildren(id).then(children => {
    //   const urls = children.map(child => child.id.slice(1, child.id.length - 1));
    //
    //   return Promise.all(urls.map(value => {
    //     return queue.add(() => getEntity(value)).catch(() => null);
    //   })).then(results => results.filter(x => x));
    // });
  }
}


export default Topic;
