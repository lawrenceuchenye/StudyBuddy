import { bearerAuth } from "hono/bearer-auth";

export const isLoggedIn = (token: string) => {
	return bearerAuth({ token });
};
