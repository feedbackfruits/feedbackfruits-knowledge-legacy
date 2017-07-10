import test from 'ava';
import Server from '../../dist/server';
import request from 'supertest';

let server = Server.create();


test('/search - Search endpoint - Basic response', t => {
  return request(server)
    .get('/search')
    .set('Accept', 'text/html')
    .expect(200)
    .then(() => {
      return t.pass();
    }, t.error);
});

test('/search - Search endpoint - Regular query', t => {
  const entities = 'http://dbpedia.org/resource/Knowledge';
  return request(server)
    .get('/search')
    .query({ 'entities[]': entities })
    .expect(200)
    .then(() => {
      return t.pass();
    }, t.error);
});
