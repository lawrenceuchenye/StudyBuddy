import MediaRepository from "@studybuddy/backend/repositories/media";
import { APIError } from "@studybuddy/backend/utils/error";
import { fileSchema, transformMongoId } from "@studybuddy/backend/utils/validator";
import { Hono } from "hono";
import { stream } from "hono/streaming";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import omit from "lodash/omit"
import Pagination from "@studybuddy/backend/utils/pagination";
import logger from "@studybuddy/backend/utils/logger";

export default new Hono()
  .post("/", async (c) => {
    const body = await c.req.parseBody()
    const mediaPayload = fileSchema.parse(body.media);

    const media = await MediaRepository.createMedia(mediaPayload)

    return c.json(Pagination.createSingleResource(omit(media, "data")))
  })
  .get("/:id", async (c) => {
    const mediaId = z.string().transform(transformMongoId).parse(c.req.param("id"))
    const media = await MediaRepository.getMedia(mediaId)

    if (!media)
      throw new APIError("Media not found!", { code: StatusCodes.NOT_FOUND })

    return stream(c, async (stream) => {
      stream.onAbort(() => {
        logger.info("Aborted streaming of media:", media._id)
      })
      await stream.write(Buffer.from(media.data, 'base64'))
    })
  })
  .get("/:id/meta", async (c) => {
    const mediaId = z.string().transform(transformMongoId).parse(c.req.param("id"))
    const media = await MediaRepository.getMedia(mediaId)

    if (!media)
      throw new APIError("Media not found!", { code: StatusCodes.NOT_FOUND })

    return c.json(Pagination.createSingleResource(omit(media, "data")))
  })


