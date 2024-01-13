import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { Router as channelsRouter } from './routes/channel'

export const app = new Hono()
  .use("*", logger())
  .route("/channels", channelsRouter)

export type App = typeof app
