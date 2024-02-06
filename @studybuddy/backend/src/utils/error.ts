import { Context, ErrorHandler } from "hono";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";
import { StatusCodes } from "http-status-codes";
import GlobalLogger from "./logger";

export class APIError extends Error {
	public declare code: StatusCodes
	public declare cause?: Error

	constructor(
		error: string,
		{ code, cause }: { cause?: Error; code: StatusCodes }
	) {
		super(error)
		this.name = "APIError"
		this.code = code
		this.cause = cause
	}
}

const logger = GlobalLogger.getSubLogger({ name: "ErrorLogger" });

export const handler: ErrorHandler = (err, c) => {
	if (err instanceof ZodError) {
		return c.json({ error: fromZodError(err) }, 400);
	}

	if (err instanceof APIError) {
		return c.json({ error: err.message }, err.code)
	}

	logger.error(err);

	return c.json({ message: "Internal server error" }, StatusCodes.INTERNAL_SERVER_ERROR);
}
