import { Hono } from "hono";
import ChannelRepository from "@studybuddy/backend/repositories/channel";
import { z } from "zod"
import { zValidator } from '@hono/zod-validator'
import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";
import Pagination from "@studybuddy/backend/utils/pagination";

export default new Hono()
  .post("/",
    zValidator("json", z.object({
      name: z.string().min(3),
      description: z.string().min(3),
      subjects: z.array(z.string().min(3)),
    })),
    async (c) => {
      const { name, description, subjects } = c.req.valid("json")
      const channel = await ChannelRepository.createChannel({
        name,
        description,
        subjects,
        creatorId: new Types.ObjectId(""),
      })
      return c.json({
        data: channel,
        message: "Channel created successfully!"
      }, StatusCodes.CREATED)
    })
  .get("/",
    async (c) => {
      const {
        page,
        perPage,
        ...filters
      } = Pagination.schema.merge(z.object({
        name: z.string(),
        subjects: z.array(z.string()),
        createdBefore: z.date(),
        createdAfter: z.date(),
      }).partial()).parse(c.req.query())

      const channelsResult = await ChannelRepository.getChannels({ page, perPage }, filters)

      if (channelsResult.isErr)
        return c.json({ message: channelsResult.error }, StatusCodes.INTERNAL_SERVER_ERROR)

      return c.json(channelsResult.value)
    })
