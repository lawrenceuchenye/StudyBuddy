import { faker } from '@faker-js/faker'
import { ulid } from "ulidx"
import { IChannel, IChannelMember } from "@studybuddy/backend/models/channel"
import ChannelRepository from "@studybuddy/backend/repositories/channel"
import { HydratedDocument } from "mongoose"

namespace ChannelSeeder {
  export const seed = (payload?: Partial<IChannel>) => ({
    name: ulid(),
    description: faker.word.words(),
    subjects: [ulid(), ulid(), ulid()],
    ...payload
  })

  export const generate = async (user: HydratedDocument<IChannelMember>, payload?: Partial<IChannel>) => {
    const channel = await ChannelRepository
      .createChannel({
        ...seed(payload),
        creatorId: user._id
      })

    return Object.assign(
      channel,
      {
        destroy: async () => {
          await ChannelRepository.deleteChannel({
            id: channel._id
          })
        }
      }
    )
  }
}

export default ChannelSeeder
