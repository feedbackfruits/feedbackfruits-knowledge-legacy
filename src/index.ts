import { PORT } from "./config";
import Server from "./server";
import * as Config from "./config";
import * as Logger from "./utils/logger";
import { ApolloEngine } from 'apollo-engine';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import {
  prepareSchema,
  specifiedRules,
  executeReactive,
  subscribe
} from 'graphql-rxjs';
import { getSchema } from './schema';

// Start the server when executed directly
declare const require: any;
if (require.main === module) {
  Logger.log("Running as script.");

  (async () => {
    // Create http server
    const server = await Server.create();
    const schema = prepareSchema(await getSchema());

    const engine = new ApolloEngine({
      apiKey: Config.APOLLO_API_KEY
    });

    engine.listen({
      port: PORT,
      httpServer: server,
    });


    Logger.log("Server started, listening on", PORT);
    // server.listen(PORT);

    // This needs to happen after the server starts listening
    const subscriptionServer = SubscriptionServer.create(
      <any>{
        schema,
        execute: executeReactive,
        subscribe,
        validationRules: specifiedRules,
      },
      {
        server: server,
        path: '/',
      },
    );
  })()

  // Export globally
  // tslint:disable-next-line no-string-literal
  global["Knowledge"] = module.exports;
}

export * from './schema';
