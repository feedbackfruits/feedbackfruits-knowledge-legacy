require('dotenv').load({ silent: true });
const MAG_API_ENDPOINT = 'https://academic.microsoft.com/api/browse/GetEntityDetails';
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
  concurrency: 16
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
  'WriteAction': '<http://schema.org/WriteAction>',
  'FieldOfStudy': '<http://academic.microsoft.com/FieldOfStudy>',
  'parentFieldOfStudy': '<http://academic.microsoft.com/parentFieldOfStudy>',
  'childFieldOfStudy': '<http://academic.microsoft.com/childFieldOfStudy>'
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

      const subject = `<http://dbpedia.org/resource/${id}>`;
      const predicate = context['sameAs'];
      const object = `<http://academic.microsoft.com/#/detail/${magId}>`;

      done[magId] = true;

      data.parentFieldsOfStudy && data.parentFieldsOfStudy.map(parent => parent.id).forEach(parentId => {
        const subject = `<http://academic.microsoft.com/#/detail/${magId}>`;
        const predicate = context['parentFieldOfStudy'];
        const object = `<http://academic.microsoft.com/#/detail/${parentId}>`;

        send({ type: 'write', quad: { subject, predicate, object }});
        doThings(parentId);
      });

      data.childFieldsOfStudy && data.childFieldsOfStudy.map(child => child.id).forEach(childId => {
        const subject = `<http://academic.microsoft.com/#/detail/${magId}>`;
        const predicate = context['childFieldOfStudy'];
        const object = `<http://academic.microsoft.com/#/detail/${childId}>`;

        send({ type: 'write', quad: { subject, predicate, object }});
        doThings(childId);
      });

      return send({ type: 'write', quad: { subject, predicate, object } });
    });
  })
}

doThings(69991583);



  // return queue.add(() => fetch(pageUrl))
  //   .then(response => response.json())
  //   .then(page => {
  //     const nextPageUrl = page.next;
  //
  //
  //     const quads = flatten(page.results.map(transformArgument));
  //
  //
  //     Promise.all(quads.map(([subject, predicate, object]) => send({ type: 'write', quad: { subject, predicate, object } }))).then(() => console.log(pageUrl));
  //
  //     return nextPageUrl ? getPage(nextPageUrl) : null;
  //   });

// getPage('http://arguman.org/api/v1/arguments/').catch(console.error);
