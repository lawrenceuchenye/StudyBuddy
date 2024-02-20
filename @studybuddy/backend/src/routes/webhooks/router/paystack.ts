import PaystackMiddleware from "@studybuddy/backend/middleware/paystack";
import TrustFundService from "@studybuddy/backend/services/trust-fund";
import { Hono } from "hono";
import { trustFundWebhookHandler } from "./handlers";

export default new Hono()
  .post("/",
    PaystackMiddleware.verify,
    async (c) => {
      const event = c.var.event

      if (event.metadata.type === "trust-fund") {
        const metadata = event.metadata as unknown as TrustFundService.TrustFundMetadata
        trustFundWebhookHandler(metadata)
      }

      return c.json({ message: "Paystack webhook received!" })
    })

