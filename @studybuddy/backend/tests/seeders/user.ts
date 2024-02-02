import { IUser } from "@studybuddy/backend/models/user"
import { faker } from '@faker-js/faker'
import UserRepository from "@studybuddy/backend/repositories/user"
import { ulid } from "ulidx"

namespace UserSeeder {
  export const seed = (payload?: Partial<IUser>) => ({
    email: faker.internet.email({ provider: ulid() }),
    firstName: faker.person.fullName(),
    lastName: faker.person.lastName(),
    password: ulid(),
    userName: ulid(),
    ...payload
  })

  export const generate = async (payload?: Partial<IUser>) => {
    const creationResult = await UserRepository
      .createUser(seed(payload))

    if (creationResult.isErr)
      throw new Error("Failed to create user")
    const user = creationResult.value

    return Object.assign(
      user,
      {
        destroy: async () => {
          const deletionResult = await UserRepository.deleteUser({
            id: user._id
          })
          if (!deletionResult)
            throw new Error("Failed to delete user")
        }
      }
    )
  }
}

export default UserSeeder
