import * as redis from 'redis';
import * as md5 from 'md5';
// import * as semtools from 'semantic-toolkit';
import { Quad, Doc, Context } from 'feedbackfruits-knowledge-engine';
import { fixJSONLD } from './schema';

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

export async function getQuads({ subject, predicate }): Promise<Quad[]> {
  // console.log(`Getting quad for <${subject}> <${predicate}> ?...?`);
  return new Promise<Quad[]>((resolve, reject) => {
    client.hget(subject, predicate, (err, res: string) => {
      if (err) return reject(err);
      if (!res) return resolve([]);
      const objects = [].concat(JSON.parse(res));
      return resolve(objects.map(object => ({ subject, predicate, object })));
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
    client.hgetall(id, async (err, res: { [key: string]: string }) => {
      if (err) return reject(err);
      if (!res) return resolve(null);
      try {
        // The result is an object with predicate as keys and strings as values
        const quads = Object.entries(res).reduce((memo, [ key, value ]) => {
          // console.log(`Parsing ${key} ${value}`);
          const parsed = JSON.parse(value);
          if (!(parsed instanceof Array)) return [ ...memo, { subject: id, predicate: key, object: parsed } ];
          const quads = parsed.map(object => ({ subject: id, predicate: key, object }));
          return [ ...memo, ...quads ];
        }, []);

        const [ expanded ] = await Doc.expand(await Doc.fromQuads(quads, Context.context), Context.context);
        const compacted = await Doc.compact(expanded, Context.context);
        const fixed = fixJSONLD(compacted);
        // console.log(`Cached result for ${id}:`, compacted);
        return resolve(fixed);
      } catch(e) {
        console.error(e);
        reject(e);
      }
    });
  });
}

export async function setDoc(doc: Doc) {
  const fixed = fixJSONLD(doc);
  const [ expanded ] = await Doc.expand(fixed, Context.context);
  const quads = await Doc.toQuads(expanded);
  // console.log(`Setting doc ${doc["@id"]} with ${quads.length} quads to cache.`);
  return setQuads(quads);
}
