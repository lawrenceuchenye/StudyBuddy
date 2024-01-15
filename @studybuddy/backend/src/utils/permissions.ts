import { defineAbility } from '@casl/ability';
import { IChannelUser } from '../models/channel';
import { HydratedDocument } from 'mongoose';

namespace PermissionsManager {
  export const ChannelUser = (user: HydratedDocument<IChannelUser>) => defineAbility((can) => {
    if (user.roles.includes("POSTER") || user.roles.includes("MODERATOR") || user.roles.includes("CREATOR")) {
      can('post', 'ChannelMessage')
    }

    can('delete', 'Channel', { creatorId: user._id })
  })
}

export default PermissionsManager
