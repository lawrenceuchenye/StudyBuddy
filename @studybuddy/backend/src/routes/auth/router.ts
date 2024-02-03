import { Hono } from "hono";
import UserRepository from "@studybuddy/backend/repositories/user";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { StatusCodes } from "http-status-codes";
import AuthService from "@studybuddy/backend/services/auth";
import TokenServive from "@studybuddy/backend/services/token";

export default new Hono()
	.post(
		"/register",
		zValidator(
			"json",
			z.object({
				firstName: z.string().min(3),
				lastName: z.string().min(3),
				userName: z.string().min(3).max(20),
				password: z.string().min(6),
				email: z.string().email({ message: "Invalid email" }),
			})
		),
		async (c) => {
			const payload = c.req.valid("json");
			const userCreationResult = await UserRepository.createUser(payload);
			if (userCreationResult.isErr) {
				const creationError = userCreationResult.error;

				return c.json(
					{
						message: "Registration Failed",
						error: creationError.message,
					},
					creationError.code
				);
			}
			return c.json(
				{
					data: userCreationResult,
					message: "User created successfully!",
				},
				StatusCodes.CREATED
			);
		}
	)
	.post(
		"/login",
		zValidator(
			"json",
			z.object({
				userNameOrEmail: z
					.string()
					.max(20)
					.or(z.string().email({ message: "Invalid email" })),
				password: z.string(),
			})
		),
		async (c) => {
			const payload = c.req.valid("json");
			const emailRegex = z.string().email().safeParse(payload.userNameOrEmail);
			const userResult = emailRegex.success
				? await UserRepository.getUser({ email: payload.userNameOrEmail })
				: await UserRepository.getUser({ userName: payload.userNameOrEmail });

			if (userResult.isErr)
				return c.json(
					{ message: userResult.error },
					StatusCodes.INTERNAL_SERVER_ERROR
				);
			const maybeUserByEmail = userResult.value;
			if (maybeUserByEmail.isJust) {
				const user = maybeUserByEmail.value;
				//check password
				if (!(await AuthService.validatePassword(payload.password, user.password)))
					return c.json(
						{ message: "Invalid credentials" },
						StatusCodes.UNAUTHORIZED
					);
				//generate access token
				const accessToken = await TokenServive.generateAccessToken(user);
				return c.json({
					message: "Login successful",
					accessToken: accessToken,
				});
			}
			return c.json(
				{ message: "Invalid credentials" },
				StatusCodes.UNAUTHORIZED
			);
		}
	);
