import * as redis from 'redis';

const client = redis.createClient();

export function has(key: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    client.exists(key, (err, res) => {
      if (err) return reject(err);
      console.log(`${key} in cache:`, res);
      return resolve(res);
    })
  });
}

export function get<V>(key: string, destringify: (str: string) => V = JSON.parse): Promise<V> {
  console.log(`Getting ${key} from cache`);
  return new Promise<V>((resolve, reject) => {
    client.get(key, (err, res) => {
      if (err) return reject(err);
      return resolve(destringify(res));
    })
  });
}

export function set<V>(key: string, value: V, stringify: (value: V) => string = JSON.stringify): Promise<boolean> {
  console.log(`Caching ${key}`);
  return new Promise<boolean>((resolve, reject) => {
    client.set(key, stringify(value), (err, res) => {
      if (err) return reject(err);
      return resolve(true);
    })
  });
}

export default {
  has,
  get,
  set
}
