import { connect } from "mongoose";
import config from "@studybuddy/backend/config";
import GlobalLogger from "./logger";

const logger = GlobalLogger.getSubLogger({ name: "DatabaseLogger" });

namespace Database {
  export async function start() {
    try {
      await connect(config.db.url)
      logger.info("Database connection established")
    }
    catch (err) {
      logger.fatal("Database connection failed", err)
      process.exit()
    }
  }
}

export default Database
