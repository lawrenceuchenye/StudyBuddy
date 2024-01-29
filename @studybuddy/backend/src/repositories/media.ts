import { Types } from "mongoose"
import { Media } from "../models/media"
import { APIError } from "../utils/error"
import { StatusCodes } from "http-status-codes"

namespace MediaRepository {
  export const createMedia = async (file: File) => {
    return Media.create({
      name: file.name,
      data: Buffer.from(await file.arrayBuffer()).toString("base64"),
      type: file.type,
      size: file.size,
      uploadedAt: new Date(),
    })
  }

  export const deleteMedia = async (id: Types.ObjectId) => {
    const { acknowledged } = await Media.deleteOne({ _id: id })
    if (!acknowledged)
      throw new APIError("Failed to delete media", { code: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}

export default MediaRepository
