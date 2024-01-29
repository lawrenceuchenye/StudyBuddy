import ServerConfig from './server'
import DatabaseConfig from './database'
import JWTConfig from './jwt'
import MailConfig from './mail'
import EnvironmentConfig from './environment'

const config = {
  environment: EnvironmentConfig,
  server: ServerConfig,
  db: DatabaseConfig,
  jwt: JWTConfig,
  mail: MailConfig
}

export default config
