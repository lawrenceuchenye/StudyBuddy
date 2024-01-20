import * as jwt from "jsonwebtoken";
import { IUser } from "../models/user";
import config from "../config";
namespace Token {
	export type Token = {
		email: string;
		userName: string;
	};

	export async function generateAccessToken(user: IUser) {
		const accessToken = jwt.sign(
			{ email: user.email, userName: user.userName },
			config.jwt.secret.accessToken,
			{ expiresIn: config.jwt.validity.accessToken }
		);

		return accessToken;
	}

	export function verifyAccessToken(accessToken: string) {
		try {
			return jwt.verify(accessToken, config.jwt.secret.accessToken) as Token;
		} catch (err) {
			if (err instanceof jwt.TokenExpiredError) return null;
			else if (err instanceof jwt.JsonWebTokenError) return null;
			throw err;
		}
	}
}

export default Token;
