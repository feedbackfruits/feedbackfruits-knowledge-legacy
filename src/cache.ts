import redis from 'redis';
import md5 from 'md5';
import { Quad, Doc, Context } from 'feedbackfruits-knowledge-engine';
import { fixJSONLD } from './schema';

import * as Config from './config';

const client = redis.createClient(Config.REDIS_URL);

function literalize(obj: any) {
  if (obj instanceof Array) return obj.map(literalize);
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'number' && obj % 1 === 0) return `"${obj}"^^<${Context.iris.xsd.integer}>`;
  if (typeof obj === 'number' && obj % 1 !== 0) return `"${obj}"^^<http://www.w3.org/2001/XMLSchema#double>`;

  throw new Error(`Object ${JSON.stringify(obj)} could not be literalized`);
}

export function dedupArray(arr: string[]) {
  return Object.keys(arr.reduce((memo, val) => ({ ...memo, [val]: true }), {}));
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
  const previousObjects = await new Promise<string[]>((resolve, reject) => {
    client.hget(subject, predicate, (err, res: string) => {
      if (err) return reject(err);
      if (!res) return resolve([]);
      const objects = [].concat(JSON.parse(res));
      resolve(objects);
    })
  });

  return new Promise((resolve, reject) => {
    client.hset(subject, predicate, JSON.stringify(dedupArray([].concat(previousObjects, object))), (err, res) => {
      if (err) return reject(err);
      return resolve(res);
      // return resolve({ subject, predicate, object: res });
    });
  });
}

export async function setQuads(quads: Quad[]) {
  return quads.reduce(async (memo, quad) => {
    await memo;
    await setQuad(quad);
    return;
  }, Promise.resolve());
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
          // console.log(`Parsing ${key} ${value} of type ${typeof value}`);
          const parsed = literalize(JSON.parse(value));
          if (!(parsed instanceof Array)) return [ ...memo, { subject: id, predicate: key, object: parsed } ];
          const quads = parsed.map(object => ({ subject: id, predicate: key, object: object }));
          return [ ...memo, ...quads ];
        }, []);

        // console.log('Got quads:', quads);
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
  // console.log(`Setting doc ${doc["@id"]} with ${quads.length} quads to cache:`, quads);
  return setQuads(quads);
}
