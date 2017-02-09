require('dotenv').load({ silent: true });
const DBPEDIA_ENDPOINT = 'http://dbpedia.org/resource/'

const {
  NAME = 'microsoft-academic-graph',
  KAFKA_ADDRESS = 'tcp://kafka:9092',
  OUTPUT_TOPIC = 'quad_update_requests'
} = process.env;

const memux = require('memux');
const fetch = require('node-fetch');
const PQueue = require('p-queue');
const jsonld = require('jsonld').promises;
const log = console.log.bind(console);

const { send } = memux({
  name: NAME,
  url: KAFKA_ADDRESS,
  output: OUTPUT_TOPIC
});

const queue = new PQueue({
  concurrency: 4
});

var context = {
  'type': '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>',
  'name': '<http://schema.org/name>',
  'text': '<http://schema.org/text>',
  'url': '<http://schema.org/url>',
  'sameAs': '<http://schema.org/sameAs>',
  'author': '<http://schema.org/author>',
  'citation': '<http://schema.org/citation>',
  'CreativeWork': '<http://schema.org/CreativeWork>',
  'Person': '<http://schema.org/Person>',
  'ReadAction': '<http://schema.org/ReadAction>',
  'WriteAction': '<http://schema.org/WriteAction>'
};

function get(id) {
  const url = `${MAG_API_ENDPOINT}?entityId=${id}&correlationId=1`;
  return fetch(url).then(response => response.json());
};


const done = {};

const getEntityIdFromWikipediaPageUrl = url => {
  const res = url.match(/en\.wikipedia\.org\/wiki\/(.*)/);
  return res && res[1];
}

let count = 0;

function doThings(magId) {
  if (magId in done) return;

  return queue.add(() => {
    console.log(count++, magId);
    return get(magId).then(data => {
      const { websites } = data;

      const id = websites.map(website => {
        const { u: url } = website;
        return getEntityIdFromWikipediaPageUrl(url);
      }).find(x => x);

      if (!id) return;

      const subject = `<dbpedia.org/resource/${id}>`;
      const predicate = context['sameAs'];
      const object = `<academic.microsoft.com/#/detail/${magId}>`;

      done[magId] = true;

      data.parentFieldsOfStudy && data.parentFieldsOfStudy.map(parent => parent.id).forEach(doThings);
      data.childFieldsOfStudy && data.childFieldsOfStudy.map(child => child.id).forEach(doThings);

      return send({ type: 'write', quad: { subject, predicate, object } });
    });
  })
}

doThings(19165224);

const {
  NAME = 'cayley-broker',
  CAYLEY_ADDRESS = 'http://cayley:64210',
  KAFKA_ADDRESS = 'tcp://kafka:9092',
  INPUT_TOPIC = 'quad_updates',
  OUTPUT_TOPIC = 'quad_update_requests'
} = process.env;

const memux = require('memux');
const Cayley = require('cayley');
const { Observable: { empty } } = require('rxjs');
const PQueue = require('p-queue');

const { source, sink, send } = memux({
  name: NAME,
  url: KAFKA_ADDRESS,
  input: INPUT_TOPIC,
  output: OUTPUT_TOPIC
});

const cayley = Cayley(CAYLEY_ADDRESS);
const queue = new PQueue({
  concurrency: 32
});

source.flatMap(({ action: { type, quad }, progress }) => {
  return queue.add(() => new Promise((resolve, reject) => {
    cayley[type]([quad], (error, body, response) => {
      if (error) return reject(error);
      if (response.statusCode >= 200 && response.statusCode < 400) return send({ type, quad }).then(resolve);

      if (response.statusCode === 400) {
        if ((body.error || body).match(/quad exists/)) return resolve();
        if ((body.error || body).match(/invalid quad/)) return resolve();
      }

      reject();
    });
  })).then(() => progress)
}).subscribe(sink);
