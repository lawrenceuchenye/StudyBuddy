import { app } from '@studybuddy/backend'
import config from '@studybuddy/backend/config'
import logger from '@studybuddy/backend/utils/logger'
import { serve } from '@hono/node-server'

serve({
  fetch: app.fetch,
  port: config.server.port
}, ({ address, port }) => {
  logger.info(`Server running on ${address}:${port}`)
})
