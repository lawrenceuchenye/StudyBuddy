import bcrypt from "bcryptjs";

namespace Auth {
	export const encryptPassword = async (password: string): Promise<string> => {
		return bcrypt.hash(password, 10);
	};

	export const validatePassword = async (
		password: string,
		hashedPassword: string
	): Promise<boolean> => {
		return bcrypt.compare(password, hashedPassword);
	};
}

export default Auth;
