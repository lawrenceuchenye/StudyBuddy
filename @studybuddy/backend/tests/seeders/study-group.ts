import { faker } from '@faker-js/faker'
import { ulid } from "ulidx"
import { IStudyGroup, IStudyGroupUser } from "@studybuddy/backend/models/study-group"
import StudyGroupRepository from "@studybuddy/backend/repositories/study-group"
import { HydratedDocument } from "mongoose"

namespace StudyGroupSeeder {
  export const seed = (payload?: Partial<IStudyGroup>) => ({
    name: ulid(),
    description: faker.word.words(),
    subjects: [ulid(), ulid(), ulid()],
    ...payload
  })

  export const generate = async (user: HydratedDocument<IStudyGroupUser>, payload?: Partial<IStudyGroup>) => {
    const channel = await StudyGroupRepository
      .createStudyGroup({
        ...seed(payload),
        creatorId: user._id
      })

    return Object.assign(
      channel,
      {
        destroy: async () => {
          await StudyGroupRepository.deleteStudyGroup({
            id: channel._id
          })
        }
      }
    )
  }
}

export default StudyGroupSeeder
