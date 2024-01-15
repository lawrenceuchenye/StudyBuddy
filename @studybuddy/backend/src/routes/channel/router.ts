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
    zValidator("query", Pagination.schema.extend({

    })),
    async (c) => {
      const channels = await ChannelRepository.getChannels({ page: 1, perPage: 10 })
    })
