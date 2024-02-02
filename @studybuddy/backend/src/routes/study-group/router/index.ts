import { Hono } from "hono";
import messagesRouter from "./message"
import membersRouter from "./member"
import studyGroupRouter from "./study-group"

export default new Hono()
  .route("/", studyGroupRouter)
  .route("/", messagesRouter)
  .route("/", membersRouter)
