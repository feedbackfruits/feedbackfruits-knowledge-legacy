require('dotenv').load({ silent: true });

const {
  SERVER_PORT = 4000,
  CAYLEY_ADDRESS = 'http://cayley:64210',
  MAG_API_ENDPOINT = 'https://academic.microsoft.com/api/browse/GetEntityDetails',
  DBPEDIA_ENDPOINT = 'http://dbpedia.org/resource/',
} = process.env;

export const Config = {
  SERVER_PORT,
  CAYLEY_ADDRESS,
  MAG_API_ENDPOINT,
  DBPEDIA_ENDPOINT,
};

export default Config;
