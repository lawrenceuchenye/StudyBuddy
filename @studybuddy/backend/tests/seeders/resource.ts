import { faker } from '@faker-js/faker'
import { ulid } from "ulidx"
import { IResource } from "@studybuddy/backend/models/resource"
import ResourceRepository from "@studybuddy/backend/repositories/resource"
import { HydratedDocument } from "mongoose"
import { File } from '@web-std/file'
import MediaRepository from '@studybuddy/backend/repositories/media'
import { IUser } from '@studybuddy/backend/models/user'

namespace ResourceSeeder {
  export const seed = (payload?: Partial<IResource>) => ({
    title: ulid(),
    shortDescription: faker.word.words({ count: 10 }),
    longDescription: faker.word.words({ count: 20 }),
    subjects: [ulid(), ulid(), ulid()],
    media: [
      new File(["content"], ulid(), { type: "text/plain" }),
      new File(["content"], ulid(), { type: "text/plain" })
    ],
    ...payload
  })

  export const generate = async (user: HydratedDocument<IUser>, payload?: Partial<IResource>) => {
    const seeded = seed(payload)
    const { media, ...rest } = seeded
    const mediaIds = await Promise.all(
      media
        .map(async (media) => {
          const mediaId = await MediaRepository.createMedia(media)
          return mediaId._id
        })
    )
    const resource = await ResourceRepository
      .createResource({
        ...rest,
        mediaIds,
        creatorId: user._id
      })

    return Object.assign(
      resource,
      {
        destroy: async () => {
          await ResourceRepository.deleteResource({
            id: resource._id
          })
        }
      }
    )
  }
}

export default ResourceSeeder
