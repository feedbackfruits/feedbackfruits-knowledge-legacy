import test from 'ava';
import * as Server from '../../dist/server';
import request from 'supertest';

let server = Server.create();


test('/search - Search endpoint - Basic response', async t => {
  const server = await Server.create();

  return request(server)
    .get('/search')
    // .set('Accept', 'text/html')
    .expect(200)
    .then(() => {
      return t.pass();
    }, (err) => {console.error('Error!', err); t.fail()});
});

test('/search - Search endpoint - Regular query', async t => {
  const server = await Server.create();
  const entities = 'http://dbpedia.org/resource/Knowledge';

  return request(server)
    .get('/search')
    .query({ 'entities[]': entities })
    .expect(200)
    .then(() => {
      return t.pass();
    }, (err) => {console.error('Error!', err); t.fail()});
});
