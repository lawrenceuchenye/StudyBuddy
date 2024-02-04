import { HydratedDocument, Query, Types } from "mongoose";
import {
	User,
	IUser,
	IUserPersonalInformation,
	IUserProfileInformation,
	IUserAcademicInformation,
	IUserContactInformation,
	IUserExtracurricularInterestInformation,
	IUserGoals,
} from "@studybuddy/backend/models/user";
import Pagination from "../utils/pagination";
import { Result, Maybe } from "true-myth";
import { APIError } from "../utils/error";
import { StatusCodes } from "http-status-codes";
import GlobalLogger from "../utils/logger";
import AuthService from "../services/auth";

namespace UserRepository {
	const logger = GlobalLogger.getSubLogger({ name: "UserRepository" });

	export async function createUser(
		payload: IUser
	): Promise<Result<HydratedDocument<IUser>, APIError>> {
		try {
			const hashedPassword = await AuthService.encryptPassword(
				payload.personalInformation?.password!
			);

			const user = await User.create(
				Object.assign(payload, {
					personalInformation: {
						...payload.personalInformation,
						password: hashedPassword,
					},
				})
			);
			return Result.ok(user);
		} catch (err) {
			logger.error(err);
			return Result.err(
				new APIError((err as Error).message, {
					code: StatusCodes.INTERNAL_SERVER_ERROR,
				})
			);
		}
	}

	export type GetUserPayload = {
		id?: Types.ObjectId;
		email?: string;
		userName?: string;
	};

	export async function getUser(
		payload: GetUserPayload
	): Promise<Result<Maybe<HydratedDocument<IUser>>, APIError>> {
		try {
			const user = payload.id
				? await User.findById({ _id: payload.id })
				: payload.email
					? await User.findOne({ "personalInformation.email": payload.email })
					: await User.findOne({
							"personalInformation.userName": payload.userName,
						});
			return Result.ok(Maybe.of(user));
		} catch (err) {
			logger.error(err);
			return Result.err(
				new APIError((err as Error).message, {
					code: StatusCodes.INTERNAL_SERVER_ERROR,
				})
			);
		}
	}

	export type UserQueryFilters = {
		name: string;
	};

	export async function searchUsers(
		paginationOptions: Pagination.QueryOptions,
		filters: UserQueryFilters
	): Promise<
		Result<Pagination.PaginatedResource<HydratedDocument<IUser>>, APIError>
	> {
		try {
			const query = User.find({ $text: { $search: filters.name } });
			const users = await query
				.clone()
				.skip(20)
				.limit(paginationOptions.perPage * (paginationOptions.page - 1))
				.exec();

			const total = await query.countDocuments();
			return Result.ok(
				Pagination.createPaginatedResource(users, {
					...paginationOptions,
					total,
				})
			);
		} catch (err) {
			logger.error(err);
			return Result.err(
				new APIError((err as Error).message, {
					code: StatusCodes.INTERNAL_SERVER_ERROR,
				})
			);
		}
	}
	export async function getUsers(
		paginationOptions: Pagination.QueryOptions
	): Promise<
		Result<Pagination.PaginatedResource<HydratedDocument<IUser>>, APIError>
	> {
		try {
			const users = await User.find({})
				.select("-personalInformation.password")
				.limit(paginationOptions.perPage * (paginationOptions.page - 1))
				.exec();

			const total = users.length;
			return Result.ok(
				Pagination.createPaginatedResource(users, {
					...paginationOptions,
					total,
				})
			);
		} catch (err) {
			logger.error(err);
			return Result.err(
				new APIError((err as Error).message, {
					code: StatusCodes.INTERNAL_SERVER_ERROR,
				})
			);
		}
	}

	export type UpdateUserPayload = Partial<Omit<IUser, "userName" | "email">> & {
		id: Types.ObjectId;
	};

	export async function updateUser(
		payload: UpdateUserPayload
	): Promise<Result<undefined, APIError>> {
		try {
			const { id, ...updatePayload } = payload;
			const { acknowledged } = await User.updateOne({ _id: id }, updatePayload);

			if (acknowledged) return Result.ok(undefined);
			return Result.err(
				new APIError("Failed to update user", {
					code: StatusCodes.INTERNAL_SERVER_ERROR,
				})
			);
		} catch (err) {
			logger.error(err);
			return Result.err(
				new APIError((err as Error).message, {
					code: StatusCodes.INTERNAL_SERVER_ERROR,
				})
			);
		}
	}

	export type DeleteUserPayload = {
		id: Types.ObjectId;
	};

	export async function deleteUser(
		payload: DeleteUserPayload
	): Promise<Result<undefined, APIError>> {
		try {
			const { acknowledged } = await User.deleteOne({ _id: payload.id });

			if (acknowledged) return Result.ok(undefined);
			return Result.err(
				new APIError("Failed to delete user", {
					code: StatusCodes.INTERNAL_SERVER_ERROR,
				})
			);
		} catch (err) {
			logger.error(err);
			return Result.err(
				new APIError((err as Error).message, {
					code: StatusCodes.INTERNAL_SERVER_ERROR,
				})
			);
		}
	}

	export type UserInformationUpdatePayload = (
		| IUserPersonalInformation
		| IUserProfileInformation
		| IUserAcademicInformation
		| IUserContactInformation
		| IUserExtracurricularInterestInformation
		| IUserGoals
	) & {
		id: Types.ObjectId;
	};
	export type UpdateTags =
		| "personal"
		| "profile"
		| "goals"
		| "academic"
		| "extra"
		| "contact";

	export async function updateUserInformation(
		payload: UserInformationUpdatePayload,
		tag: UpdateTags
	): Promise<Result<undefined, APIError>> {
		try {
			const { id, ...updatePayload } = payload;

			const user = await User.findById(id);
			if (!user)
				return Result.err(
					new APIError("Failed to update user", {
						code: StatusCodes.NOT_FOUND,
					})
				);

			switch (tag) {
				case "personal":
					let d = updatePayload as IUserPersonalInformation;
					if (d.password) {
						const hashedPassword = await AuthService.encryptPassword(d.password!);
						d = Object.assign(d, { password: hashedPassword });
					}
					const pi = Object.assign(user, {
						personalInformation: {
							...user.personalInformation,
							...d,
						},
					});
					pi.save();
					break;
				case "profile":
					const pr = Object.assign(user, {
						profileInformation: {
							...user.profileInformation,
							...updatePayload,
						},
					});
					pr.save();
					break;
				case "contact":
					const nPayload = updatePayload as IUserContactInformation;
					const contact = Object.assign(user, {
						contactInformation: {
							...user.contactInformation,
							...nPayload,
							social: {
								...user.contactInformation?.social,
								...nPayload.social,
							},
						},
					});
					contact.save();
					break;
				case "academic":
					const acaInfo = updatePayload as IUserAcademicInformation;
					const nDups = user.academicInformation?.coursesEnrolled?.filter(
						(item) =>
							item.year != acaInfo.coursesEnrolled?.[0].year &&
							item.semester != acaInfo.coursesEnrolled?.[0].semester
					);
					const courses = [...nDups!, ...acaInfo.coursesEnrolled!];

					const aca = Object.assign(user, {
						academicInformation: {
							...user.academicInformation,
							...acaInfo,
							coursesEnrolled: courses,
						},
					});
					aca.save();
					break;
				case "extra":
					const nExtra =
						updatePayload as IUserExtracurricularInterestInformation;

					const extra = Object.assign(user, {
						extracurricularInformation: {
							...user.extracurricularInformation,
							...nExtra,
							clubsOrOrganizations: [
								...new Set([
									...user.extracurricularInformation?.clubsOrOrganizations!,
									...(nExtra?.clubsOrOrganizations! || []),
								]),
							],
							hobbies: [
								...new Set([
									...user.extracurricularInformation?.hobbies!,
									...(nExtra?.hobbies! || []),
								]),
							],
							skills: [
								...new Set([
									...user.extracurricularInformation?.skills!,
									...(nExtra?.skills! || []),
								]),
							],
							interests: [
								...new Set([
									...user.extracurricularInformation?.interests!,
									...(nExtra?.interests! || []),
								]),
							],
						},
					});
					extra.save();
					break;
				case "goals":
					const nGoal = updatePayload as IUserGoals;
					const goals = Object.assign(user, {
						academicGoals: [
							...user?.academicGoals!,
							{
								...updatePayload,
							},
						],
					});
					goals.save();
					break;
				default:
					throw new Error("Invalid action, unknown update payload");
			}

			return Result.ok(undefined);
		} catch (err) {
			logger.error(err);
			return Result.err(
				new APIError((err as Error).message, {
					code: StatusCodes.INTERNAL_SERVER_ERROR,
				})
			);
		}
	}
}

export default UserRepository;
