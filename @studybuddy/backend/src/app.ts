import { Hono } from "hono";
import { logger } from "hono/logger";
import { swaggerUI } from "@hono/swagger-ui";
import { serveStatic } from "@hono/node-server/serve-static";

import { Router as channelsRouter } from "./routes/channel";
import { Router as authRouter } from "./routes/auth";
import { Router as systemRouter } from "./routes/system";
import { Router as userRouter } from "./routes/users";
import { Router as mediaRouter } from "./routes/media";
import { Router as studyGroupRouter } from "./routes/study-group";
import { Router as resourcesRouter } from "./routes/resource";

import Database from "./utils/database";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";
import { StatusCodes } from "http-status-codes";
import GlobalLogger from "./utils/logger";
import { APIError } from "./utils/error";

const errorLogger = GlobalLogger.getSubLogger({ name: "ErrorLogger" });
const stopDatabase = await Database.start();

const gracefulShutdown = async () => {
	stopDatabase();
	process.exit();
};

process.on("uncaughtException", gracefulShutdown);
process.on("exit", gracefulShutdown);
process.on("unhandledRejection", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

export const app = new Hono()
	.use("*", logger())
	.use("/api/v1", swaggerUI({ url: "/doc" }))
	.route("/channels", channelsRouter)
	.route("/auth", authRouter)
	.route("/system", systemRouter)
	.route("/users", userRouter)
	.get("/static/*", serveStatic({ root: "./" }))
	.get("/ui", swaggerUI({ url: "/static/openapi.yaml" }))
	.route("/auth", authRouter)
	.route("/media", mediaRouter)
	.route("/channels", channelsRouter)
	.route("/study-groups", studyGroupRouter)
	.route("/resources", resourcesRouter)
	.onError((err, c) => {
		if (err instanceof ZodError) {
			return c.json({ error: fromZodError(err) }, 400);
		}

		if (err instanceof APIError) {
			return c.json({ error: err.message }, err.code);
		}

		errorLogger.error(err);

		return c.json(
			{
				message: "Internal server error",
			},
			StatusCodes.INTERNAL_SERVER_ERROR
		);
	});

export type App = typeof app;
