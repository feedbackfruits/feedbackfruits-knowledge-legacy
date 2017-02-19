import _fetch, { RequestInit, Response } from 'node-fetch';
import PQueue = require('p-queue');

import Cache from './cache';

const queue = new PQueue({
  concurrency: 16
});

export function fetch(url: string, init?: RequestInit): Promise<Response> {
  console.log(`Fetching ${url}`);
  return queue.add(async () => {
    if (await Cache.has(url)) return new Response(await Cache.get<string>(url));
    return _fetch(url, init).then(async (res) => {
      if (res.status !== 200) return res;
      const text = await res.text();
      await Cache.set(url, text);
      return new Response(text);
    });
  });
}

export default fetch;
