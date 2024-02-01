import { Hono } from "hono";
import channelsRouter from "./channel"
import messagesRouter from "./message"
import membersRouter from "./member"

export default new Hono()
  .route("/", channelsRouter)
  .route("/", messagesRouter)
  .route("/", membersRouter)
