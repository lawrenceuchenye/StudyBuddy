import { Router as channelsRouter } from "./channel";
import { Router as authRouter } from "./auth";
import { Router as mediaRouter } from "./media";
import { Router as studyGroupRouter } from "./study-group";
import { Router as resourcesRouter } from "./resource";
import { Router as tutorProfilesRouter } from "./tutor-profile";
import { Router as postRouter } from "./post"

import { Hono } from "hono"

export default new Hono()
  .route("/auth", authRouter)
  .route("/media", mediaRouter)
  .route("/channels", channelsRouter)
  .route("/study-groups", studyGroupRouter)
  .route("/resources", resourcesRouter)
  .route("/tutors", tutorProfilesRouter)
  .route("/posts", postRouter)
