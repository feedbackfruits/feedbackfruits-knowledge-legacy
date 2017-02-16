require('dotenv').load({ silent: true });

export const {
  SERVER_PORT = 4000,
  CAYLEY_ADDRESS = 'http://cayley:64210',
  MAG_API_ENDPOINT = 'https://academic.microsoft.com/api/browse/GetEntityDetails',
  DBPEDIA_ENDPOINT = 'http://dbpedia.org/resource/',
  DBPEDIA_SPARQL_ENDPOINT = 'http://dbpedia.org/sparql'
} = process.env;
