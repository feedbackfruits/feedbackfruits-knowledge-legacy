require('dotenv').load({ silent: true });

export const {
  PORT = 4000,
  CAYLEY_ADDRESS = 'http://localhost:64210/',
  ELASTICSEARCH_ADDRESS = 'http://localhost:9200',
  ELASTICSEARCH_INDEX_NAME = 'knowledge',
  MAG_API_ENDPOINT = 'https://academic.microsoft.com/api/browse/GetEntityDetails',
  DBPEDIA_ENDPOINT = 'http://dbpedia.org/resource/',
  DBPEDIA_SPARQL_ENDPOINT = 'http://dbpedia.org/sparql',
  MAG_API_KEY
} = process.env;
