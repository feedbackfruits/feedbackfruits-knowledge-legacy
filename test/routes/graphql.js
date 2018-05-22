import test from 'ava';
import * as Server from '../../dist/server';
import request from 'supertest';

let server = Server.create();

const log = console.log.bind(console); // eslint-disable-line no-console

test('/ - GraphIQL  - Basic response', async t => {
  const server = await Server.create();

  return request(server)
    .get('/')
    .set('Accept', 'text/html')
    .expect(200)
    .then((res) => {
      log('Passed test with', res.status, res.body);
      return t.pass();
    }, t.error);
});

  test('/ - GraphQL - Empty query body', async t => {
    const server = await Server.create();

  return request(server)
    .post('/')
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    // .query({ query: '' })
    .send({ })
    .expect(400)
    .then((res) => {
      log('Passed test with', res.status, res.body);
      return t.pass();
    }, t.error);
});

test('/ - GraphQL - Regular query', async t => {
  const server = await Server.create();

  const query = `

query resource {
  video(id: "https://www.youtube.com/watch?v=Efoeqb6tC88") {
    id
    type {
      id
    }

    name
    description
    image {
      id
    }
    license {
      id
    }
    sourceOrganization {
      id
    }

    tag {
      id
    }

    caption {
      id
      startsAfter
      duration
    }

  }
}
`;

  return request(server)
    .post('/')
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    // .set('Content-Type', )
    // .query({ query })
    .send({ query })    // .query({ query: '{}' })
    // .expect('Content-Type', 'application/json; charset=utf-8')
    // .expect('Content-Length', '15')
    .expect(200)
    .then((res) => {
      log('Passed test with', res.status, JSON.stringify(res.body));
      return t.pass();
    }, (err) => {console.error('Error!', err); t.fail()});
});
