import { PORT } from "./config";
import Server from "./server";
import * as Config from "./config";
import * as Logger from "./utils/logger";
import { ApolloEngine } from 'apollo-engine';

// Start the server when executed directly
declare const require: any;
if (require.main === module) {
  Logger.log("Running as script.");

  (async () => {
    // Create http server
    const server = await Server.create();

    const engine = new ApolloEngine({
      apiKey: Config.APOLLO_API_KEY
    });

    engine.listen({
      port: PORT,
      expressApp: server,
    });


    Logger.log("Server started, listening on", PORT);
    // server.listen(PORT);
  })()

  // Export globally
  // tslint:disable-next-line no-string-literal
  global["Knowledge"] = module.exports;
}

export * from './schema';
