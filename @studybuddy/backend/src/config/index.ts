import ServerConfig from './server'
import DatabaseConfig from './database'
import JWTConfig from './jwt'
import MailConfig from './mail'
import EnvironmentConfig from './environment'
import PaystackConfig from './paystack'

const config = {
  environment: EnvironmentConfig,
  server: ServerConfig,
  db: DatabaseConfig,
  jwt: JWTConfig,
  mail: MailConfig,
  paystack: PaystackConfig,
}

export default config
