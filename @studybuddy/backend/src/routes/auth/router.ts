import { Hono } from "hono";
import UserRepository from "@studybuddy/backend/repositories/user";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Types, ObjectId } from "mongoose";
import { StatusCodes } from "http-status-codes";
import Pagination from "@studybuddy/backend/utils/pagination";
import { transformMongoId } from "@studybuddy/backend/utils/validator";
import { Maybe } from "true-myth";
import Auth from "@studybuddy/backend/utils/auth";
import Token from "@studybuddy/backend/utils/token";
import {
	IUser,
	IUserGoals,
	InitialFields,
} from "@studybuddy/backend/models/user";
import {
	ObjectKeyProp,
	filterObjectKeys,
	removeEmptyKeys,
} from "@studybuddy/backend/utils/helper";
import { json } from "stream/consumers";

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
					//TODO: remove ID from object only pass from authenticated user
					id: z.string().transform(transformMongoId),
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
					social: z
						.object({
							twitter: z.string(),
							facebook: z.string(),
							twitch: z.string(),
							instagram: z.string(),
							discord: z.string(),
						})
						.partial(),
					goals: z.object({
						title: z.string(),
						description: z.string(),
						typeOfGoal: z.enum(["short term", "long term"]),
						estimatedAchieventDate: z.coerce.date(),
						achieventDate: z.coerce.date(),
						achieved: z.boolean(),
					}),
					institutionName: z.string(),
					studendId: z.string(),
					departmentName: z.string(),
					yearOfStudy: z.number(),
					gpa: z.number(),
					graduationYear: z.number(),
					admissionYear: z.number(),
					enrollmentStatus: z.string(),
					coursesEnrolled: z.array(
						z.object({
							year: z.number(),
							semester: z.number(),
							courses: z.array(z.string()),
						})
					),
					clubsOrOrganizations: z.array(z.string()),
					hobbies: z.array(z.string()),
					skills: z.array(z.string()),
					interests: z.array(z.string()),
				})
				.partial()
		),
		async (c) => {
			const payload = c.req.valid(
				"json"
			) as UserRepository.UserInformationUpdatePayload;
			const tag = c.req.query()["tag"] as UserRepository.UpdateTags;

			let filteredPayload = removeEmptyKeys(
				payload
			) as UserRepository.UserInformationUpdatePayload;

			switch (tag) {
				case "personal":
					filteredPayload = filterObjectKeys(filteredPayload, [
						"id",
						"firstName",
						"lastName",
						"password",
					]) as UserRepository.UserInformationUpdatePayload;
					break;
				case "profile":
					filteredPayload = filterObjectKeys(filteredPayload, [
						"id",
						"shareProfile",
						"nationality",
						"city",
						"gender",
					]) as UserRepository.UserInformationUpdatePayload;
					break;
				case "goals":
					const goals = {
						...c.req.valid("json").goals,
						id: filteredPayload.id,
					} as { [key: string]: any };
					filteredPayload = filterObjectKeys(goals, [
						"id",
						"title",
						"description",
						"typeOfGoal",
						"estimatedAchieventDate",
						"achieventDate",
						"achieved",
					]) as UserRepository.UserInformationUpdatePayload;
					break;
				case "academic":
					filteredPayload = filterObjectKeys(filteredPayload, [
						"id",
						"institutionName",
						"studendId",
						"departmentName",
						"yearOfStudy",
						"gpa",
						"graduationYear",
						"admissionYear",
						"enrollmentStatus",
						"coursesEnrolled",
					]) as UserRepository.UserInformationUpdatePayload;
					break;
				case "extra":
					filteredPayload = filterObjectKeys(payload, [
						"id",
						"clubsOrOrganizations",
						"hobbies",
						"skills",
						"interests",
					]) as UserRepository.UserInformationUpdatePayload;
					break;
				case "contact":
					filteredPayload = filterObjectKeys(payload, [
						"id",
						"phoneNumber",
						"address",
						"social",
					]) as UserRepository.UserInformationUpdatePayload;
					break;
				default:
					console.log("invalid case");
			}

			console.log("read payload accurately", filteredPayload);
			// if(tag == 'username') return;
			const updateResult = await UserRepository.updateUserInformation(
				filteredPayload,
				tag
			);
			if (updateResult.isErr) {
				const updateError = updateResult.error;

				return c.json(
					{
						message: "Updating user information failed",
						error: updateError.message,
					},
					updateError.code
				);
			}
			return c.json(
				{
					data: updateResult,
					message: "Profile updated successfully!",
				},
				StatusCodes.ACCEPTED
			);
		}
	);
