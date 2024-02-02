import { Schema, Types, model } from "mongoose";

export interface IUser {
	personalInformation?: IUserPersonalInformation;
	profileInformation?: IUserProfileInformation;
	contactInformation?: IUserContactInformation;
	academicInformation?: IUserAcademicInformation;
	extracurricularInformation?: IUserExtracurricularInterestInformation;
	academicGoals?: IUserGoals;
}
export interface IUserPersonalInformation {
	firstName: string;
	lastName: string;
	userName: string;
	password: string;
	email: string;
}
export interface IUserProfileInformation {
	shareProfile?: boolean;
	nationality?: string;
	city?: string;
	gender?: string;
}

export type IUserContactInformation = {
	phoneNumber?: string;
	address?: string;
	social?: {
		instagram?: string;
		facebook?: string;
		twitter?: string;
		tiktok?: string;
		twitch?: string;
		discord?: string;
	};
};

export type IUserGoals = {
	title: string;
	description: string;
	typeOfGoal: "short term" | "long term";
	estimatedAchieventDate: Date | null;
	achieventDate: Date | null;
	achieved: boolean;
}[];
export interface IUserAcademicInformation {
	institutionName?: string;
	studendId?: string;
	departmentName?: string;
	yearOfStudy?: number | null;
	gpa?: number | null;
	graduationYear?: number | null;
	admissionYear?: number | null;
	enrollmentStatus?: "enrolled" | "not enrolled";
	coursesEnrolled?:
		| { year: number; semester: string; courses: string[] }[]
		| [];
}

export interface IUserExtracurricularInterestInformation {
	clubsOrOrganizations?: string[];
	hobbies?: string[];
	skills?: string[];
	interests?: string[];
}

const userSchema = new Schema<IUser>(
	{
		personalInformation: {
			firstName: { type: String, required: true },
			lastName: { type: String, required: true },
			userName: { type: String, required: true, unique: true },
			password: { type: String, required: true }, //TODO: encrypted password
			email: { type: String, required: true, unique: true },
		},
		profileInformation: {
			shareProfile: { type: Boolean, required: false, default: false },
			nationality: { type: String, required: false },
			city: { type: String, required: false },
			gender: { type: String, required: false },
		},
		contactInformation: {
			phoneNumber: { type: String, required: false },
			social: {
				twitch: { type: String, required: false },
				twitter: { type: String, required: false },
				tiktok: { type: String, required: false },
				facebook: { type: String, required: false },
				discord: { type: String, required: false },
				instagram: { type: String, required: false },
			},
			address: { type: String, required: false },
		},
		academicInformation: {
			institutionName: { type: String, required: false },
			studendId: { type: String, required: false },
			departmentName: { type: String, required: false },
			yearOfStudy: { type: Number, required: false },
			gpa: { type: Number, required: false },
			graduationYear: { type: Number, required: false },
			admissionYear: { type: Number, required: false },
			enrollmentStatus: {
				type: String,
				required: false,
				default: "not enrolled",
			},
			coursesEnrolled: [
				{
					year: { type: Number, required: false },
					semester: { type: String, required: false },
					courses: [{ type: String, required: false }],
				},
			],
		},
		academicGoals: [
			{
				title: { type: String, required: false },
				description: { type: String, required: false },
				typeOfGoal: {
					type: String,
					required: false,
					enum: ["short term", "long term"],
				},
				estimatedAchieventDate: Date,
				achieventDate: Date,
				achieved: { type: String, required: false },
			},
		],
		extracurricularInformation: {
			clubsOrOrganizations: [{ type: String, required: false }],
			hobbies: [{ type: String, required: false }],
			skills: [{ type: String, required: false }],
			interests: [{ type: String, required: false }],
		},
	},
	{ timestamps: true }
);

export const User = model<IUser>("User", userSchema);

export const InitialFields: IUser = {
	profileInformation: {
		shareProfile: false,
		nationality: "",
		city: "",
		gender: "",
	},
	contactInformation: {
		phoneNumber: "",
		social: {
			instagram: "",
			facebook: "",
			twitter: "",
			tiktok: "",
			twitch: "",
			discord: "",
		},
		address: "",
	},
	academicInformation: {
		institutionName: "",
		studendId: "",
		departmentName: "",
		yearOfStudy: null,
		gpa: null,
		graduationYear: null,
		admissionYear: null,
		enrollmentStatus: "not enrolled" as const,
		coursesEnrolled: [],
	},
	academicGoals: [],
	extracurricularInformation: {
		clubsOrOrganizations: [],
		hobbies: [],
		skills: [],
		interests: [],
	},
};
