import test from 'ava';
import Server from '../../dist/server';
import request from 'supertest';

let server = Server.create();

const log = console.log.bind(console); // eslint-disable-line no-console

test('/ - GraphIQL  - Basic response', t => {
  return request(server)
    .get('/')
    .set('Accept', 'text/html')
    .expect(200)
    .then((res) => {
      log('Passed test with', res.status, res.body);
      return t.pass();
    }, t.error);
});

test('/ - GraphQL - Empty query body', t => {
  return request(server)
    .post('/')
    .set('Content-Type', 'application/json')
    .query({ query: '' })
    .send({ })
    .expect(400)
    .then((res) => {
      log('Passed test with', res.status, res.body);
      return t.pass();
    }, t.error);
});

test('/ - GraphQL - Regular query', t => {
  const query = `
  query {
    entity(id: "http://dbpedia.org/resource/Number_theory") {
      id
      type {
        id
      }

      name
      fieldOfStudy {
        id
        type {
          id
        }
        name

        parentFieldOfStudy {
          id

          entity {
            id
          }
        }

        childFieldOfStudy {
          id
        }

        entity {
          id
        }
      }

      subjectOf {
        id
        type {
          id
        }

        about {
          id
        }
        name
        description
        license
        sourceOrganization
        topic {
          id
          type {
            id
          }
          name
          previous {
            id
          }

          next {
            id
          }

          parent {
            id
          }

          child {
            id
          }
        }
      }
    }
  }
`;

  return request(server)
    .post('/')
    .set('Content-Type', 'application/json')
    // .set('Content-Type', )
    .query({ query })
    .send({ })    // .query({ query: '{}' })
    .expect('Content-Type', 'application/json; charset=utf-8')
    // .expect('Content-Length', '15')
    .expect(200)
    .then((res) => {
      log('Passed test with', res.status, JSON.stringify(res.body));
      return t.pass();
    }, (err) => {console.error('Error!', err); t.fail()});
});
