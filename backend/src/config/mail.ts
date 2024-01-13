import { env } from "@studybud/backend/env"

export default {
	host: env.MAIL_HOST,
	port: env.MAIL_PORT,
	secure: false,
	auth: {
		user: env.MAIL_USERNAME,
		pass: env.MAIL_PASSWORD
	},
	sender: env.MAIL_USERNAME
}
