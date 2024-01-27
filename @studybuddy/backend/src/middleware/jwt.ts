import { MiddlewareHandler } from "hono"
import { StatusCodes } from "http-status-codes"
import { IUser } from "../models/user"
import Token from "../utils/token"
import UserRepository from "../repositories/user"
import { HydratedDocument } from "mongoose"

namespace JwtMiddleware {
  export const verify: MiddlewareHandler<{
    Variables: {
      user: HydratedDocument<IUser>
    }
  }> = async (c, next) => {
    const authHeader = c.req.header("authorization")
    if (!authHeader)
      return c.json({ message: "Invalid token" }, StatusCodes.UNAUTHORIZED)

    const [, suppliedAccessToken] = authHeader.split(" ")
    if (!suppliedAccessToken)
      return c.json({ message: "Invalid token" }, StatusCodes.UNAUTHORIZED)

    const verifiedAccessToken =
      Token.verifyAccessToken(suppliedAccessToken)
    if (!verifiedAccessToken)
      return c.json({ message: "Invalid token" }, StatusCodes.UNAUTHORIZED)

    const userFetchResult = await UserRepository.getUser({
      email: verifiedAccessToken.email
    })

    if (userFetchResult.isErr)
      return c.json({ message: userFetchResult.error.message }, userFetchResult.error.code)

    const maybeUser = userFetchResult.value

    if (maybeUser.isNothing)
      return c.json({ message: "Invalid token" }, StatusCodes.UNAUTHORIZED)

    c.set('user', maybeUser.value)

    await next()
  }
}

export default JwtMiddleware
