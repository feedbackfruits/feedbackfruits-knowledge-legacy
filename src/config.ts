require("dotenv").load({ silent: true });

const {
  NODE_ENV = 'development',
  PORT = 4000,
  CAYLEY_ADDRESS = "http://localhost:64210/",
  ELASTICSEARCH_ADDRESS = "http://localhost:9200",
  ELASTICSEARCH_INDEX_NAME = "knowledge",
  REDIS_URL = undefined,

  MAG_API_ENDPOINT = "https://academic.microsoft.com/api/browse/GetEntityDetails",
  DBPEDIA_ENDPOINT = "http://dbpedia.org/resource/",
  DBPEDIA_SPARQL_ENDPOINT = "http://dbpedia.org/sparql",
  MAG_API_KEY,
  APOLLO_API_KEY,

  HEROKU_APP_NAME = undefined,
} = process.env;

const SEARCH_ORGANIZATIONS: string[] = 'SEARCH_ORGANIZATIONS' in process.env ? process.env.SEARCH_ORGANIZATIONS.split(',') : [
  "https://www.khanacademy.org/",
  "https://www.youtube.com/user/MIT",
  "https://www.youtube.com/channel/UCOoVmLA0M1IS1JU7ZTUk8jA", // "Dynamics TU Delft",
  "https://www.youtube.com/user/METUOpenCourseWare", // "METUOpenCourseWare",
  "https://www.youtube.com/channel/UC4XB8AQCiucZ7324-UaYA4A", // "Mathematics TU Delft",
  "https://www.youtube.com/user/OxfordSBS", // "OxfordSBS",
  "https://www.youtube.com/channel/UCBktixD-Y_kixzSJy9OrlZw", // "TU Delft Online Learning",
  "https://www.youtube.com/user/ucberkeleycampuslife", // "UCBerkeley",
  "https://www.youtube.com/channel/UCngehmCV-65FikHYUV1_qXA", // "UCIrvineOCW",
  "https://www.youtube.com/user/UCLACourses", // "UCLACourses",
  "https://www.youtube.com/user/YaleCourses", // "YaleCourses"
];

let HOST = 'HOST' in process.env ? process.env.HOST : `ws://localhost:${PORT}/`;

if (NODE_ENV === 'review') {
  HOST = `wss://${HEROKU_APP_NAME}.herokuapp.com/`;
}

export {
  PORT,
  HOST,
  CAYLEY_ADDRESS,
  ELASTICSEARCH_ADDRESS,
  ELASTICSEARCH_INDEX_NAME,
  REDIS_URL,
  MAG_API_ENDPOINT,
  DBPEDIA_ENDPOINT,
  DBPEDIA_SPARQL_ENDPOINT,
  MAG_API_KEY,
  APOLLO_API_KEY,
  SEARCH_ORGANIZATIONS,
};
