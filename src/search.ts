import { graphql } from "graphql";
import Schema from "./schema";
import * as Logger from "./utils/logger";

const globalDone = {};

const Context = {
  Knowledge: {
    Topic: "https://knowledge.express/Topic",
    Resource: "https://knowledge.express/Resource",
    Entity: "https://knowledge.express/Entity"
  }
};

const RootFields = {
  [Context.Knowledge.Topic]: "topic",
  [Context.Knowledge.Resource]: "resource",
  [Context.Knowledge.Entity]: "entity"
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
    entities: 0.3
  },
  [Context.Knowledge.Entity]: {
    resources: 0.7
  }
};

const Attributes = {
  [Context.Knowledge.Topic]: ["name", "description"],
  [Context.Knowledge.Entity]: ["name", "description"],
  [Context.Knowledge.Resource]: ["name", "description", "license", "sourceOrganization"]
};

const threshold = 0.7;

const get = (done = {}, query) => {
  if (query in done) {
    return done[query];
  }

  return done[query] = graphql(Schema, query);
};

const matchTypes = {
  [Context.Knowledge.Resource]: true,
  // [Context.Knowledge.Entity]: true,
};

const match = document => {
  return document.type in matchTypes;
};

const go = ({ done = {}, results = [], score = 1 } = {}, { id, type }) => {
  if (score < threshold) {
    return Promise.resolve({ done, results, score });
  }

  if (!id || !type) {
    return Promise.resolve({ done, results, score });
  }

  const rootField = RootFields[type];
  if (!rootField) {
    return Promise.resolve({ done, results, score });
  }

  const edges = Edges[type] || {};
  const attributes = Attributes[type] || [];

  const query = `
    query {
      ${rootField}(id: "${id}") {
        id,
        type,
        name,
        description,
        ${attributes.join(",\n")},
        ${Object.keys(edges).map(edge => `${edge} { id, type }`).join(",\n")}
      }
    }
  `;

  return get(done, query).then(({data}) => {
    const document = data[rootField];

    if (!document) {
      return { done, results, score };
    }

    if (match(document)) {
      results.push({
        score, document
      });
    }

    return Promise.all(Object.entries(edges).map(([edge, penalty]) => {
      return Promise.all(document[edge].map(object => {
        let newScore = score * (penalty as number);

        Logger.log(`Scoring object: ${JSON.stringify(object)}`);
        if (object.type === Context.Knowledge.Entity) {
          Logger.log(`Boosting by type ${object.type}`);
          newScore *= 2;
        }
        if (object.id === "http://dbpedia.org/resource/Statistics") {
          Logger.log(`Boosting by id ${object.id}`);
          newScore *= 2;
        }

        return go({ done, results, score: newScore }, object);
      }));
    }));
  }).then(() => {
    return { done, results, score };
  });
};

function formatResults(results) {
  return Object.entries(results.reduce((memo, {score, document}) => {
    if (document.id in memo) {
      memo[document.id] = { score: memo[document.id].score + score, document };
    } else {
      memo[document.id] = { score, document };
    }

    return memo;
  }, {})).sort(([aId, { score: aScore }], [bId, { score: bScore } ]) => {
    return aScore > bScore ? -1 : 1;
  }).map(([id, { score, document }]) => {
    return {
      id,
      score,
      type: document.type,
      name: document.name,
      description: document.description,
      license: document.license,
      sourceOrganization: document.sourceOrganization,
      entities: document.entities
    };
  });
}

function combineResults(results, otherResults) {
  return [].concat(results, otherResults);
}

export async function search(entities) {
  // const done = {};
  const results = await Promise.all(entities.map(id => {
    return go(globalDone, { id, type: Context.Knowledge.Entity}).then(({ results: res }) => res);
  }));

  return formatResults(results.reduce(combineResults, []));
}

export default search;
