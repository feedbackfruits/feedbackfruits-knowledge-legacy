require("dotenv").load({ silent: true });

const {
  PORT = 4000,
  CAYLEY_ADDRESS = "http://localhost:64210/",
  ELASTICSEARCH_ADDRESS = "http://localhost:9200",
  ELASTICSEARCH_INDEX_NAME = "knowledge",
  MAG_API_ENDPOINT = "https://academic.microsoft.com/api/browse/GetEntityDetails",
  DBPEDIA_ENDPOINT = "http://dbpedia.org/resource/",
  DBPEDIA_SPARQL_ENDPOINT = "http://dbpedia.org/sparql",
  MAG_API_KEY
} = process.env;

const SEARCH_ORGANIZATIONS: string[] = 'SEARCH_ORGANIZATIONS' in process.env ? process.env.SEARCH_ORGANIZATIONS.split(',') : [
  "https://www.khanacademy.org/",
  "Dynamics TU Delft",
  "UCIrvineOCW",
  "TU Delft Online Learning",
  "OxfordSBS",
  "UCBerkeley",
  "UCLACourses",
  "METUOpenCourseWare",
  "MIT",
  "Mathematics TU Delft",
  "YaleCourses",
];

export {
  PORT,
  CAYLEY_ADDRESS,
  ELASTICSEARCH_ADDRESS,
  ELASTICSEARCH_INDEX_NAME,
  MAG_API_ENDPOINT,
  DBPEDIA_ENDPOINT,
  DBPEDIA_SPARQL_ENDPOINT,
  MAG_API_KEY,
  SEARCH_ORGANIZATIONS,
};
