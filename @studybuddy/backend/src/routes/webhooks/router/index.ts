import { Hono } from "hono";
import paystackRouter from "./paystack";

export default new Hono()
  .route("/paystack", paystackRouter)
