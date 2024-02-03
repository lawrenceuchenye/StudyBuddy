import bcrypt from "bcryptjs";

namespace AuthService {
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

export default AuthService;
