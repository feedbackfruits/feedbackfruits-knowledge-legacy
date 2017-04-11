import fetch from 'node-fetch';

const log = console.log.bind(console);
const deirify = iri => iri.slice(1, iri.length - 1);

const Context = {
  Knowledge: {
    Topic: 'https://knowledge.express/Topic',
    Resource: 'https://knowledge.express/Resource',
    Entity: 'https://knowledge.express/Entity'
  }
};

const RootFields = {
  [Context.Knowledge.Topic]: 'topic',
  [Context.Knowledge.Resource]: 'resource',
  [Context.Knowledge.Entity]: 'entity'
};

const Edges = {
  [Context.Knowledge.Topic]: {
    children: 0.5,
    parents: 0.5,
    successors: 0.9,
    predecessors: 0.1,
    resources: 0.5
  },
  [Context.Knowledge.Resource]: {
    topics: 0.5,
    entities: 0.1
  },
  [Context.Knowledge.Entity]: {
    resources: 0.1
  }
};

const Attributes = {
  [Context.Knowledge.Topic]: ['name', 'description']
};

const threshold = 0.05;

const get = (done = {}, query) => {
  if(query in done) return done[query];
  return done[query] = fetch('http://localhost:4000/?', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  }).then(response => response.json());
};


const matchTypes = {
  [Context.Knowledge.Resource]: true,
  [Context.Knowledge.Entity]: true,
}

const match = document => {
  return document.type in matchTypes;
};


const go = ({ done = {}, results = [], score = 1 } = {}, { id, type }) => {
  if (score < threshold) return Promise.resolve({ done, results, score });
  if (!id || !type) return Promise.resolve({ done, results, score });

  const rootField = RootFields[type];
  if (!rootField) return Promise.resolve({ done, results, score });

  const edges = Edges[type] || {};
  const attributes = Attributes[type] || [];

  const query = `
    query {
      ${rootField}(id: "${id}") {
        id,
        type,
        ${attributes.join(",\n")},
        ${Object.keys(edges).map(edge => `${edge} { id, type }`).join(",\n")}
      }
    }
  `;

  return get(done, query).then(({data}) => {
    const document = data[rootField];

    if (!document) return { done, results, score };

    if (match(document)) {
      results.push({
        score, document
      });
    }

    return Promise.all(Object.entries(edges).map(([edge, penalty]) => {
      return Promise.all(document[edge].map(object => {
        let newScore = score * <number>penalty;

        console.log(`Scoring object: ${JSON.stringify(object)}`);
        if (object.type === Context.Knowledge.Entity) {
          console.log(`Boosting by type ${object.type}`);
          newScore *= 2;
        }
        if (object.id === 'http://dbpedia.org/resource/Statistics') {
          console.log(`Boosting by id ${object.id}`);
          newScore *= 2;
        }


        return go({ done, results, score: newScore }, object);
      }));
    }));
  }).then(() => {
    return { done, results, score };
  });
}

function formatResults(results) {
  return Object.entries(results.reduce((memo, {score, document}) => {
    if (document.id in memo) {
      memo[document.id] = memo[document.id] + score;
    } else {
      memo[document.id] = score;
    }

    return memo;
  }, {})).sort(([aId, aScore], [bId, bScore]) => {
    return aScore > bScore ? -1 : 1;
  });
}

export async function search(query) {
  // const id = "https://www.youtube.com/watch?v=IY8BXNFgnyI";
  const type = Context.Knowledge.Entity;

  console.log(`Searching for "${query}"`);
  const results = await go({}, { id: query, type }).then(({results}) => formatResults(results)); // .then(log);
  return [].concat(results);
}

export default search;
