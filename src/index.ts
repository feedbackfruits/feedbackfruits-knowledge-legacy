import { SERVER_PORT } from './config';
import Server from './server';
import Schema from './schema';

// Start the server when executed directly
declare const require: any;
if (require.main === module) {
  console.log('Running as script.');

  // Create http server
  let server = Server.create();

  console.log("Server started, listening on", SERVER_PORT);
  server.listen(SERVER_PORT);

  // Export globally
  global['Knowledge'] = module.exports;
}

export default {
  Server,
  Schema
}
