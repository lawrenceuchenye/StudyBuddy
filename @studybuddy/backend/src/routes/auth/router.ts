import { Hono } from "hono";
import UserRepository from "@studybuddy/backend/repositories/user";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";
import Pagination from "@studybuddy/backend/utils/pagination";
import { transformMongoId } from "@studybuddy/backend/utils/validator";
import { Maybe } from "true-myth";
import Auth from "@studybuddy/backend/utils/auth";
import Token from "@studybuddy/backend/utils/token";
import { IUser, InitialFields } from "@studybuddy/backend/models/user";

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
			const refinedPayload: IUser = Object.assign(
				InitialFields,

				{
					personalInformation: payload,
				}
			);
			const userCreationResult = await UserRepository.createUser(
				refinedPayload
			);
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
				if (
					!(await Auth.validatePassword(
						payload.password,
						user.personalInformation?.password!
					))
				)
					return c.json(
						{ message: "Invalid credentials" },
						StatusCodes.UNAUTHORIZED
					);
				//generate access token
				const accessToken = await Token.generateAccessToken(user);
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
	)
	.patch(
		"/profile",
		zValidator(
			"json",
			z
				.object({
					firstName: z.string().min(3),
					lastName: z.string().min(3),
					userName: z.string().min(3).max(20),
					password: z.string().min(6),
					email: z.string().email({ message: "Invalid email" }),
					shareProfile: z.boolean(),
					nationality: z.string(),
					city: z.string(),
					gender: z.string(),
					phoneNumber: z.number(),
					address: z.string(),
					social: z.array(z.string()),
					title: z.string(),
					description: z.string(),
					typeOfGoal: z.string(),
					estimatedAchieventDate: z.date(),
					achieventDate: z.date(),
					achieved: z.boolean(),
					institutionName: z.string(),
					studendId: z.string(),
					departmentName: z.string(),
					yearOfStudy: z.number(),
					gpa: z.number(),
					graduationYear: z.number(),
					admissionYear: z.number(),
					enrollmentStatus: z.string(),
					coursesEnrolled: z.object({
						year: z.number(),
						semester: z.string(),
						courses: z.array(z.string()),
					}),
				})
				.partial()
		),
		async (c) => {
			const payload = c.req.valid(
				"json"
			) as UserRepository.UserInformationUpdatePayload;
			const tag = c.req.query()["tag"] as UserRepository.UpdateTags;
			console.log(typeof tag, tag, payload);

			switch (tag) {
				case "personal":
					break;
				case "profile":
					break;
				case "goals":
					break;
				case "academic":
					break;
				case "extra":
					break;
				case "contact":
					break;
				default:
					console.log("invalid case");
			}

			const userCreationResult = await UserRepository.updateUserInformation(
				payload,
				tag
			);
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
	);
