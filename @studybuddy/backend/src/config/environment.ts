import { env } from "../env";

namespace EnvironmentConfig {
  export const production = env.NODE_ENV === "production"
  export const development = env.NODE_ENV === "development"
  export const test = env.NODE_ENV === "test"
}

export default EnvironmentConfig
