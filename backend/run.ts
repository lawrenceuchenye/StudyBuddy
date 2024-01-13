import app from '@backend'
import config from '@backend/config'
import logger from '@backend/utils/logger'
import { serve } from '@hono/node-server'

serve({
  fetch: app.fetch,
  port: config.server.port
}, (addrInfo) => {
    logger.info(`Server running on ${addrInfo.address}:${addrInfo.port}`)
})
