import PaystackMiddleware from "@studybuddy/backend/middleware/paystack";
import { Hono } from "hono";

export default new Hono()
  .post("/",
    PaystackMiddleware.verify,
    async (c) => {
      const event = c.var.event

      return c.json({ message: "Paystack webhook received!" })
    })

