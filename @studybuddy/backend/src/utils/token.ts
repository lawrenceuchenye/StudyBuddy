import jwt from "jsonwebtoken";
import { IUser } from "../models/user";
import config from "../config";

namespace Token {
	export type Token = {
		email: string;
		userName: string;
	};

	export async function generateAccessToken(user: IUser) {
		return jwt.sign(
			{ email: user.email, userName: user.userName },
			config.jwt.secret.accessToken,
			{ expiresIn: config.jwt.validity.accessToken }
		);
	}

	export async function verifyAccessToken(accessToken: string) {
		return jwt.verify(accessToken, config.jwt.secret.accessToken) as Token;
	}
}

export default Token;
