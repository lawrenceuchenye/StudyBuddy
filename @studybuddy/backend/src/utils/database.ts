import { connect, disconnect } from "mongoose";
import config from "@studybuddy/backend/config";
import GlobalLogger from "./logger";
import { MongoMemoryServer } from 'mongodb-memory-server';

const logger = GlobalLogger.getSubLogger({ name: "DatabaseLogger" });

namespace Database {
  const getUrl = async (): Promise<{ url: string, disconnect: () => Promise<void> }> => {
    if (config.environment.test) {
      const mongod = await MongoMemoryServer.create();

      const url = mongod.getUri();

      return {
        disconnect: async () => {
          mongod.stop()
        },
        url
      }
    }

    return {
      disconnect,
      url: config.db.url
    }
  }

  export async function start(): Promise<() => void> {
    try {
      const { url, disconnect } = await getUrl()

      await connect(url)
      logger.info("Database connection established")

      return disconnect
    }
    catch (err) {
      logger.fatal("Database connection failed", err)
      throw err
    }
  }
}

export default Database
