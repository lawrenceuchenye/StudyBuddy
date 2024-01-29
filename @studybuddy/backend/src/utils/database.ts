import { connect, disconnect } from "mongoose";
import config from "@studybuddy/backend/config";
import GlobalLogger from "./logger";

const logger = GlobalLogger.getSubLogger({ name: "DatabaseLogger" });

namespace Database {
  export async function start(): Promise<() => void> {
    try {
      await connect(config.db.url)

      logger.info("Database connection established")

      return async () => disconnect()
    }
    catch (err) {
      logger.fatal("Database connection failed", err)
      throw err
    }
  }
}

export default Database
