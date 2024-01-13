import ServerConfig from './server'
import DatabaseConfig from './database'
import JWTConfig from './jwt'
import MailConfig from './mail'

const config = {
  server: ServerConfig,
  db: DatabaseConfig,
  jwt: JWTConfig,
  mail: MailConfig
}

export default config
