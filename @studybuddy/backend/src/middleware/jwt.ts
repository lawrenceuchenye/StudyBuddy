import { MiddlewareHandler } from "hono"
import { StatusCodes } from "http-status-codes"
import { IUser } from "../models/user"
import TokenServive from "../services/token"
import UserRepository from "../repositories/user"
import { HydratedDocument } from "mongoose"
import { APIError } from "../utils/error"

namespace JwtMiddleware {
  export const verify: MiddlewareHandler<{
    Variables: {
      user: HydratedDocument<IUser>
    }
  }> = async (c, next) => {
    const authHeader = c.req.header("authorization")
    if (!authHeader)
      throw new APIError("Invalid token!", { code: StatusCodes.UNAUTHORIZED })

    const [, suppliedAccessToken] = authHeader.split(" ")
    if (!suppliedAccessToken)
      throw new APIError("Invalid token!", { code: StatusCodes.UNAUTHORIZED })

    const verifiedAccessToken =
      await TokenServive.verifyAccessToken(suppliedAccessToken)
    if (!verifiedAccessToken)
      throw new APIError("Invalid token!", { code: StatusCodes.UNAUTHORIZED })

    const userFetchResult = await UserRepository.getUser({
      email: verifiedAccessToken.email
    })

    if (userFetchResult.isErr)
      return c.json({ message: userFetchResult.error.message }, userFetchResult.error.code)

    const maybeUser = userFetchResult.value

    if (maybeUser.isNothing)
      throw new APIError("Invalid token!", { code: StatusCodes.UNAUTHORIZED })

    c.set('user', maybeUser.value)

    await next()
  }
}

export default JwtMiddleware
