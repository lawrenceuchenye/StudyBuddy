import { faker } from '@faker-js/faker'
import { ulid } from "ulidx"
import { IChannel, IChannelUser } from "@studybuddy/backend/models/channel"
import ChannelRepository from "@studybuddy/backend/repositories/channel"
import { HydratedDocument } from "mongoose"

namespace ChannelSeeder {
  export const seed = (payload?: Partial<IChannel>) => ({
    name: ulid(),
    description: faker.word.words(),
    subjects: [ulid(), ulid(), ulid()],
    ...payload
  })

  export const generate = async (user: HydratedDocument<IChannelUser>, payload?: Partial<IChannel>) => {
    const creationResult = await ChannelRepository
      .createChannel({
        ...seed(payload),
        creatorId: user._id
      })

    if (creationResult.isErr)
      throw new Error("Failed to create channel")
    const channel = creationResult.value

    return Object.assign(
      channel,
      {
        destroy: async () => {
          const deletionResult = await ChannelRepository.deleteChannel({
            id: channel._id
          })
          if (!deletionResult)
            throw new Error("Failed to delete channel")
        }
      }
    )
  }
}

export default ChannelSeeder
