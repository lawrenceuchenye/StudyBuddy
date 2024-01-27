import { Hono } from "hono";
import { logger } from "hono/logger";
import { Router as channelsRouter } from "./routes/channel";
import { Router as authRouter } from "./routes/auth";
import Database from "./utils/database";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";
import { StatusCodes } from "http-status-codes";
import GlobalLogger from "./utils/logger";
import { APIError } from "./utils/error";

const errorLogger = GlobalLogger.getSubLogger({ name: "ErrorLogger" });
await Database.start();

export const app = new Hono()
	.use("*", logger())
	.route("/channels", channelsRouter)
	.route("/auth", authRouter)
	.onError((err, c) => {
		if (err instanceof ZodError) {
			return c.json({ error: fromZodError(err) }, 400);
		}

		if (err instanceof APIError) {
			return c.json({ error: err.message }, err.code)
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
