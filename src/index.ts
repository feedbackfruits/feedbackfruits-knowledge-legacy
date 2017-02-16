import Config from './config';
import Server from './server';
import Schema from './schema';

// Start the server when executed directly
declare const require: any;
if (require.main === module) {
  console.log('Running as script.');

  let { SERVER_PORT: port } = Config;

  // Create http server
  let server = Server.create();

  console.log("Server started, listening on", port);
  server.listen(port);

  // Export globally
  global['Knowledge'] = module.exports;
}

export default {
  Config,
  Server,
  Schema
}
