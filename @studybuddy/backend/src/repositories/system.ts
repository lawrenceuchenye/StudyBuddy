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

namespace SystemRepository {
	const logger = GlobalLogger.getSubLogger({ name: "SystemRepository" });

	function calculateSimilarity(user1: IUser, user2: IUser) {
		let score = 0;

		// Profile Information
		(function () {
			if (
				user1.profileInformation?.gender === user2.profileInformation?.gender
			) {
				score += 1;
			}
			if (
				user1.profileInformation?.nationality ===
				user2.profileInformation?.nationality
			) {
				score += 1;
			}
			if (user1.profileInformation?.city === user2.profileInformation?.city) {
				score += 2;
			}
			if (
				user1.profileInformation?.gender === user2.profileInformation?.gender
			) {
				score += 2;
			}
		})();

		// Academic Information
		(function () {
			if (
				user1.academicInformation?.admissionYear ===
				user2.academicInformation?.admissionYear
			) {
				score += 3;
			}
			if (
				user1.academicInformation?.departmentName ===
				user2.academicInformation?.departmentName
			) {
				score += 3;
			}
			if (
				user1.academicInformation?.enrollmentStatus ===
				user2.academicInformation?.enrollmentStatus
			) {
				score += 2;
			}
			if (
				user1.academicInformation?.graduationYear ===
				user2.academicInformation?.graduationYear
			) {
				score += 3;
			}
			if (
				user1.academicInformation?.institutionName ===
				user2.academicInformation?.institutionName
			) {
				score += 3;
			}
			if (
				user1.academicInformation?.yearOfStudy ===
				user2.academicInformation?.yearOfStudy
			) {
				score += 3;
			}
			user1.academicInformation?.coursesEnrolled?.forEach((course, index) => {
				if (course === user2.academicInformation?.coursesEnrolled?.[index]) {
					score += 10;
				}
				const contained = user2.academicInformation?.coursesEnrolled?.find(
					(item) => {
						return (
							course.year === item.year && course.semester === item.semester
						);
					}
				);
				if (contained) {
					score += 2;
				}
			});
			const commonCourse = (
				user1.academicInformation?.coursesEnrolled || []
			).filter((course1) =>
				(user2.academicInformation?.coursesEnrolled || []).some((course2) =>
					course2.courses.includes(course1.courses[0])
				)
			);
			if (commonCourse.length > 0) {
				score += commonCourse.length * 2;
			}
		})();

		// Academic Goals
		(function () {
			const commonGoalsTitle = user1.academicGoals?.filter((goal1) =>
				user2.academicGoals?.some((goal2) => goal1.title === goal2.title)
			);
			const commonGoalsDes = user1.academicGoals?.filter((goal1) =>
				user2.academicGoals?.some(
					(goal2) => goal1.description === goal2.description
				)
			);
			const commonGoalsType = user1.academicGoals?.filter((goal1) =>
				user2.academicGoals?.some(
					(goal2) => goal1.typeOfGoal === goal2.typeOfGoal
				)
			);
			const commonGoalsAchieved = user1.academicGoals?.filter((goal1) =>
				user2.academicGoals?.some((goal2) => goal1.achieved === goal2.achieved)
			);
			const commonGoalsEstAc = user1.academicGoals?.filter((goal1) =>
				user2.academicGoals?.some(
					(goal2) =>
						goal1.estimatedAchieventDate === goal2.estimatedAchieventDate
				)
			);
			const commonGoalsAc = user1.academicGoals?.filter((goal1) =>
				user2.academicGoals?.some(
					(goal2) => goal1.achieventDate === goal2.achieventDate
				)
			);
			score += commonGoalsTitle?.length! * 5;
			score += commonGoalsDes?.length! * 5;
			score += commonGoalsType?.length! * 1;
			score += commonGoalsAchieved?.length! * 2;
			score += commonGoalsEstAc?.length! * 1;
			score += commonGoalsAc?.length! * 1;
		})();

		// Extracurricular Information
		(function () {
			const commonInterests =
				user1.extracurricularInformation?.interests?.filter((interest1) =>
					user2.extracurricularInformation?.interests?.includes(interest1)
				);
			const commonHobbies = user1.extracurricularInformation?.hobbies?.filter(
				(hobbies) =>
					user2.extracurricularInformation?.hobbies?.includes(hobbies)
			);
			const commonClubs =
				user1.extracurricularInformation?.clubsOrOrganizations?.filter(
					(clubs) =>
						user2.extracurricularInformation?.clubsOrOrganizations?.includes(
							clubs
						)
				);
			const commonSkills = user1.extracurricularInformation?.skills?.filter(
				(skills) =>
					user2.extracurricularInformation?.clubsOrOrganizations?.includes(
						skills
					)
			);
			score += commonInterests?.length! * 5;
			score += commonHobbies?.length! * 5;
			score += commonClubs?.length! * 5;
			score += commonSkills?.length! * 5;
		})();

		return score;
	}

	function findMatchingUsers(
		currentUser: IUser,
		allUsers: IUser[],
		score: number
	) {
		const matches: { user: IUser; similarityScore: number }[] = [];

		allUsers.forEach((user) => {
			if (user !== currentUser) {
				const similarityScore = calculateSimilarity(currentUser, user);
				if (similarityScore > score) {
					matches.push({
						user,
						similarityScore,
					});
				}
			}
		});

		return matches.sort((a, b) => b.similarityScore - a.similarityScore);
	}

	export async function getUserMatches(
		id: Types.ObjectId,
		paginationOptions: Pagination.QueryOptions
	): Promise<
		Result<Maybe<{ user: IUser; similarityScore: number }[]>, APIError>
	> {
		try {
			const user = await User.findById(id).select("-password");
			if (!user)
				return Result.err(
					new APIError("User not found", {
						code: StatusCodes.NOT_FOUND,
					})
				);
			const allUsers = await User.find({})
				.select("-password")
				.limit(paginationOptions.perPage)
				.skip(paginationOptions.perPage * (paginationOptions.page - 1))
				.exec();

			//create matches
			const matches = findMatchingUsers(user, allUsers, 15);
			return Result.ok(Maybe.of(matches));
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

export default SystemRepository;
