import test from 'ava';
import * as Server from '../../dist/server';
import request from 'supertest';

test('/autocomplete - Autocomplete endpoint - Basic response', async t => {
  const server = await Server.create();

  return request(server)
    .get('/autocomplete')
    .set('Accept', 'text/html')
    .expect(200)
    .then(() => {
      return t.pass();
    }, (err) => {console.error('Error!', err); t.fail()});
});

test('/autocomplete - Autocomplete endpoint - Empty query', async t => {
  const server = await Server.create();

  return request(server)
    .get('/autocomplete')
    .query({ text: '' })
    .set('Accept', 'text/html')
    .expect(200)
    .then(() => {
      return t.pass();
    }, (err) => {console.error('Error!', err); t.fail()});
});

  test('/autocomplete - Autocomplete endpoint - Normal query', async t => {
    const server = await Server.create();

  return request(server)
    .get('/autocomplete')
    .query({ text: 'knowledge' })
    .set('Accept', 'text/html')
    .expect(200)
    .then(() => {
      return t.pass();
    }, (err) => {console.error('Error!', err); t.fail()});
});
