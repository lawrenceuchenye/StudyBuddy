import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { Router as channelsRouter } from './routes/channel'
import Database from './utils/database'
import { fromZodError } from "zod-validation-error";
import { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import GlobalLogger from './utils/logger';

const errorLogger = GlobalLogger.getSubLogger({ name: "ErrorLogger" })
await Database.start()

export const app = new Hono()
  .use("*", logger())
  .route("/channels", channelsRouter)
  .onError((err, c) => {
    if (err instanceof ZodError) {
      return c.json({ error: fromZodError(err) }, 400)
    }

    errorLogger.error(err)

    return c.json({
      message: "Internal server error"
    }, StatusCodes.INTERNAL_SERVER_ERROR)
  })

export type App = typeof app
