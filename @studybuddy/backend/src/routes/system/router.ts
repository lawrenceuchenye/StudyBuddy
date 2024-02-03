import { Hono } from "hono";
import SystemRepository from "@studybuddy/backend/repositories/system";

import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Types, ObjectId } from "mongoose";
import { StatusCodes } from "http-status-codes";
import Pagination from "@studybuddy/backend/utils/pagination";
import { transformMongoId } from "@studybuddy/backend/utils/validator";
import { Maybe } from "true-myth";

export default new Hono().get("/matches/:id", async (c) => {
	const id = z.string().transform(transformMongoId).parse(c.req.param("id"));
	const paginate = Pagination.schema.parse(c.req.query());

	const userMatches = await SystemRepository.getUserMatches(id, paginate);
	if (userMatches.isErr) {
		const matchError = userMatches.error;

		return c.json(
			{
				message: "Matching Users failed",
				error: matchError.message,
			},
			matchError.code
		);
	}
	return c.json(
		{
			data: userMatches.value,
			message: `found all matches`,
		},
		StatusCodes.OK
	);
});
