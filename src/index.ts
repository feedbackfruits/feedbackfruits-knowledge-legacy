import { PORT } from "./config";
import Schema from "./schema";
import Server from "./server";
import * as Logger from "./utils/logger";

// Start the server when executed directly
declare const require: any;
if (require.main === module) {
  Logger.log("Running as script.");

  // Create http server
  const server = Server.create();

  Logger.log("Server started, listening on", PORT);
  server.listen(PORT);

  // Export globally
  // tslint:disable-next-line no-string-literal
  global["Knowledge"] = module.exports;
}

export default {
  Server,
  Schema
};
