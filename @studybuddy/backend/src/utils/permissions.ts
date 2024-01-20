import { defineAbility } from '@casl/ability';
import { IChannelUser } from '../models/channel';
import { HydratedDocument } from 'mongoose';

namespace PermissionsManager {
  export const ChannelUser = (user: HydratedDocument<IChannelUser>) => defineAbility((can) => {
    if (user.role === "POSTER" || user.role === "MODERATOR" || user.role === "CREATOR") {
      can('post', 'ChannelMessage')
    }

    if (user.role === "MODERATOR" || user.role === "CREATOR") {
      can('delete', "ChannelMessage")
    }
    else {
      can('delete', 'ChannelMessage', { senderId: user._id })
    }

    can('delete', 'Channel', { creatorId: user._id })
  })
}

export default PermissionsManager
