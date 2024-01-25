import { Schema, Types, model } from "mongoose";

export interface IUser {
	firstName: string;
	lastName: string;
	userName: string;
	password: string;
	email: string;
}

const userSchema = new Schema<IUser>(
	{
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		userName: { type: String, required: true, unique: true },
		password: { type: String, required: true }, //TODO: encrypted password
		email: { type: String, required: true, unique: true },
	},
	{ timestamps: true }
);

export const User = model<IUser>("User", userSchema);
