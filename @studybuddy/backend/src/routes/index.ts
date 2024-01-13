import { Router as channelsRouter } from './channel'
import { Hono } from 'hono'

export default new Hono()
  .route("/channels", channelsRouter)
