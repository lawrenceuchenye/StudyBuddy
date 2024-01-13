import { Hono } from "hono";
import { createPaginatedResource } from "@backend/utils/pagination";

export default new Hono()
  .get("/", (c) => {
    return c.json(createPaginatedResource({}))
  })
