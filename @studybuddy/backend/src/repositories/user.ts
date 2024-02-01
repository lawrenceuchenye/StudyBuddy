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
import PermissionsManager from "../utils/permissions";
import { Result, Maybe } from "true-myth";
import { APIError } from "../utils/error";
import { StatusCodes } from "http-status-codes";
import GlobalLogger from "../utils/logger";
import Auth from "../utils/auth";

namespace UserRepository {
	const logger = GlobalLogger.getSubLogger({ name: "UserRepository" });

	export async function createUser(
		payload: IUser
	): Promise<Result<HydratedDocument<IUser>, APIError>> {
		try {
			const hashedPassword = await Auth.encryptPassword(
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
				? await User.findOne({ email: payload.email })
				: await User.findOne({ userName: payload.userName });
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

	export async function getUsers(
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
						const hashedPassword = await Auth.encryptPassword(d.password!);
						d = Object.assign(d, { password: hashedPassword });
					}
					const pi = Object.assign({}, user, {
						personalInformation: {
							...user.personalInformation,
							...d,
						},
					});
					pi.save();
					break;
				case "profile":
					const pr = Object.assign({}, user, {
						profileInformation: {
							...user.profileInformation,
							...updatePayload,
						},
					});
					pr.save();
					break;
				case "contact":
					const contact = Object.assign({}, user, {
						contactInformation: {
							...user.contactInformation,
							...updatePayload,
						},
					});
					contact.save();
					break;
				case "academic":
					const aca = Object.assign({}, user, {
						academicInformation: {
							...user.academicInformation,
							...updatePayload,
						},
					});
					aca.save();
					break;
				case "extra":
					const extra = Object.assign({}, user, {
						extracurricularInformation: {
							...user.extracurricularInformation,
							...updatePayload,
						},
					});
					extra.save();
					break;
				case "goals":
					const goals = Object.assign({}, user, {
						academicGoals: {
							...user.academicGoals,
							...updatePayload,
						},
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
