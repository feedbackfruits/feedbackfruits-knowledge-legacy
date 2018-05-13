import * as redis from 'redis';
import * as md5 from 'md5';
// import * as semtools from 'semantic-toolkit';
import { Quad, Doc, Context } from 'feedbackfruits-knowledge-engine';

import * as Config from './config';

const client = redis.createClient(Config.REDIS_URL);

function quadsBySubject(quads: Quad[]): { [index: string]: string[] } {
  const bySubject = quads.reduce<{ [index: string]: { [index: string]: string | string[] } }>((memo, { subject, predicate, object }) => {
    if (!(subject in memo)) memo[subject] = { [predicate]: object };
    else if (!(predicate in memo[subject])) memo[subject] = { ...memo[subject], [predicate]: object};
    else memo[subject] = { ...memo[subject], [predicate]: [].concat(memo[subject][predicate], object) };

    // memo[subject] = subject in memo ? { ...memo[subject], [predicate]: object} : { [predicate]: object };
    return memo;
  }, {});

  // return bySubject;
  return Object.entries(bySubject).reduce((memo, [ key, value ]) => {
    const values = Object.entries(value).reduce((memo, [ key, value ]) => {
      return [].concat(memo, key, JSON.stringify(value));
    }, []);

    return {
      ...memo,
      [key]: values
    }
  }, {});
}

export async function getQuad({ subject, predicate }): Promise<Quad> {
  // console.log(`Getting quad for <${subject}> <${predicate}> ?...?`);
  return new Promise<Quad>((resolve, reject) => {
    client.hget(subject, predicate, (err, res) => {
      if (err) return reject(err);
      if (!res) return resolve(null);
      return resolve({ subject, predicate, object: JSON.parse(res) });
    });
  });
}

export async function setQuad({ subject, predicate, object }) {
  // console.log(`Setting quad <${subject}> <${predicate}> ?...?`);
  return new Promise((resolve, reject) => {
    client.hset(subject, predicate, JSON.stringify(object), (err, res) => {
      if (err) return reject(err);
      return resolve(res);
      // return resolve({ subject, predicate, object: res });
    });
  });
}

export async function setQuads(quads: Quad[]) {
  const bySubject = quadsBySubject(quads);

  return Promise.all(Object.entries(bySubject).map(([ key, values ]) => {
    return new Promise((resolve, reject) => {
      // console.log(`Caching ${values.length} values under ${key}:`, values);
      client.hmset(key, values, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  }));
}

export async function getDoc(id: string): Promise<Doc> {
  // console.log(`Getting doc ${id} from cache.`);
  return new Promise((resolve, reject) => {
    client.hgetall(id, async (err, res) => {
      if (err) return reject(err);
      // The result is an object with predicate as keys and strings as values
      const quads = Object.entries(res).reduce((memo, [ key, value ]) => {
        // console.log(`Parsing ${key} ${value}`);
        const quad = { subject: id, predicate: key, object: value };
        return [ ...memo, quad ];
      }, []);

      const [ expanded ] = await Doc.expand(await Doc.fromQuads(quads, Context.context), Context.context);
      const compacted = await Doc.compact(expanded, Context.context);
      return resolve(compacted);
    });
  });
}

export async function setDoc(doc: Doc) {
  // console.log(`Setting doc ${doc["@id"]} to cache.`);
  const quads = await Doc.toQuads(doc);
  return setQuads(quads);
}

// export function hashKey(key: string): string {
//   return md5(key);
// }
//
// export async function has(key: string): Promise<boolean> {
//   return new Promise<boolean>((resolve, reject) => {
//     client.exists(hashKey(key), (err, res) => {
//       if (err) return reject(err);
//       console.log(`${hashKey(key)} in cache:`, res);
//       return resolve(!!res);
//     })
//   });
// }
//
// export async function get<V>(key: string, destringify: (str: string) => V = JSON.parse): Promise<V> {
//   // console.log(`Getting ${key} from cache`);
//   return new Promise<V>((resolve, reject) => {
//     client.get(hashKey(key), (err, res) => {
//       if (err) return reject(err);
//       console.log("Just got:", res);
//       return resolve(destringify(res));
//     })
//   });
// }
//
// export async function set<V>(key: string, value: V, stringify: (value: V) => string = JSON.stringify): Promise<V> {
//   // console.log(`Caching ${key}`);
//   return new Promise<V>((resolve, reject) => {
//     client.set(hashKey(key), stringify(value), (err, res) => {
//       if (err) return reject(err);
//       console.log("Just set:", value);
//       return resolve(value);
//     })
//   });
// }
