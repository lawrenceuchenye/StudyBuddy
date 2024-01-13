import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
	clientPrefix: "",
	client: {},
	server: {
		NODE_ENV: z.enum(["production", "development", "test"]),
		PORT: z.coerce.number().min(0).max(65535),
		DATABASE_URL: z.string().url(),
		ACCESS_TOKEN_SECRET: z.string().min(32),
		REFRESH_TOKEN_SECRET: z.string().min(32),
		REFRESH_TOKEN_VALIDITY_PERIOD: z.coerce.number(),
		ACCESS_TOKEN_VALIDITY_PERIOD: z.coerce.number(),
		OTP_VALIDITY_PERIOD: z.coerce.number(),
		MAIL_HOST: z.string(),
		MAIL_PORT: z.coerce.number().min(1).max(65535),
		MAIL_USERNAME: z.string().min(1),
		MAIL_PASSWORD: z.string().min(1),
	},
	/**
	 * Makes sure you explicitly access **all** environment variables
	 * from `server` and `client` in your `runtimeEnv`.
	 */
	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		PORT: process.env.BACKEND_PORT,
		DATABASE_URL: process.env.BACKEND_DATABASE_URL,
		ACCESS_TOKEN_SECRET: process.env.BACKEND_ACCESS_TOKEN_SECRET,
		REFRESH_TOKEN_SECRET: process.env.BACKEND_REFRESH_TOKEN_SECRET,
		REFRESH_TOKEN_VALIDITY_PERIOD: process.env.BACKEND_REFRESH_TOKEN_VALIDITY_PERIOD,
		ACCESS_TOKEN_VALIDITY_PERIOD: process.env.BACKEND_ACCESS_TOKEN_VALIDITY_PERIOD,
		OTP_VALIDITY_PERIOD: process.env.BACKEND_OTP_VALIDITY_PERIOD,
		MAIL_HOST: process.env.BACKEND_MAIL_HOST,
		MAIL_PORT: process.env.BACKEND_MAIL_PORT,
		MAIL_USERNAME: process.env.BACKEND_MAIL_USERNAME,
		MAIL_PASSWORD: process.env.BACKEND_MAIL_PASSWORD,
	}
})
