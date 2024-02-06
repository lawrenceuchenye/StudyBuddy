import { Hono } from "hono";
import { logger } from "hono/logger";
import { swaggerUI } from '@hono/swagger-ui'
import { serveStatic } from '@hono/node-server/serve-static'

import Database from "./utils/database";
import routes from "./routes";
import { handler as errorHandler } from "./utils/error"

const stopDatabase = await Database.start();

const gracefulShutdown = async () => {
	stopDatabase()
	process.exit()
}

process.on("uncaughtException", gracefulShutdown)
process.on("exit", gracefulShutdown)
process.on("unhandledRejection", gracefulShutdown)
process.on("SIGINT", gracefulShutdown)

export const app = new Hono()
	.use("*", logger())
	.get('/static/*', serveStatic({ root: './' }))
	.get('/ui', swaggerUI({ url: '/static/openapi.yaml' }))
	.route("/", routes)
	.onError(errorHandler);

export type App = typeof app;
