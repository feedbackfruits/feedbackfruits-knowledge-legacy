import test from 'ava';
import Server from '../../dist/server';
import request from 'supertest';

let server = Server.create();

test('/autocomplete - Autocomplete endpoint - Basic response', t => {
  return request(server)
    .get('/autocomplete')
    .set('Accept', 'text/html')
    .expect(200)
    .then(() => {
      return t.pass();
    }, (err) => {console.error('Error!', err); t.fail()});
});

test('/autocomplete - Autocomplete endpoint - Empty query', t => {
  return request(server)
    .get('/autocomplete')
    .query({ text: '' })
    .set('Accept', 'text/html')
    .expect(200)
    .then(() => {
      return t.pass();
    }, (err) => {console.error('Error!', err); t.fail()});
});

test('/autocomplete - Autocomplete endpoint - Normal query', t => {
  return request(server)
    .get('/autocomplete')
    .query({ text: 'knowledge' })
    .set('Accept', 'text/html')
    .expect(200)
    .then(() => {
      return t.pass();
    }, (err) => {console.error('Error!', err); t.fail()});
});
