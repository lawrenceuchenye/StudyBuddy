import { Hono } from "hono";
import ChannelRepository from "@studybuddy/backend/repositories/channel";
import { z } from "zod"
import { zValidator } from '@hono/zod-validator'
import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";

export default new Hono()
  .post("/",
    zValidator("json", z.object({
      name: z.string().min(3)
    })),
    async (c) => {
      const { name } = c.req.valid("json")
      const channel = await ChannelRepository.createChannel({
        name,
        creatorId: new Types.ObjectId(""),
      })
      return c.json({
        data: channel,
        message: "Channel created successfully!"
      }, StatusCodes.CREATED)
    })
