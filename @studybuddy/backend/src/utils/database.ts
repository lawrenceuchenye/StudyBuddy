import { connect } from "mongoose";
import config from "@studybuddy/backend/config";

namespace Database {
  export async function start() {
    await connect(config.db.url)
  }
}

export default Database
