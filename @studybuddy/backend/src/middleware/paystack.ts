import { MiddlewareHandler } from "hono"
import { StatusCodes } from "http-status-codes"
import { APIError } from "../utils/error"
import crypto from "crypto"
import config from "../config"
import { z } from "zod"

const paystackEventSchema = z.object({
  event: z.literal("charge.success"),
  metadata: z.record(z.unknown()),
  amount: z.number(),
  reference: z.string()
})

export type PaystackEvent = z.infer<typeof paystackEventSchema>

namespace PaystackMiddleware {
  export const verify: MiddlewareHandler<{
    Variables: {
      event: PaystackEvent
    }
  }> = async (c, next) => {
    const json = paystackEventSchema.parse(await c.req.json())

    const hash = crypto.createHmac('sha512', config.paystack.secretKey)
      .update(JSON.stringify(json))
      .digest('hex');

    const signature = c.req.header("x-paystack-signature")

    if (hash === signature)
      throw new APIError("Invalid signature!", { code: StatusCodes.UNAUTHORIZED })

    c.set("event", json)

    next()
  }
}

export default PaystackMiddleware

