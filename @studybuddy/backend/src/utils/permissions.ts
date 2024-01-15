import { defineAbility } from '@casl/ability';
import { IChannelUser } from '../models/channel';

namespace PermissionsManager {
  export const ChannelUser = (user: IChannelUser) => defineAbility((can) => {
    if (user.roles.includes("POSTER") || user.roles.includes("MODERATOR") || user.roles.includes("CREATOR")) {
      can('post', 'ChannelMessage')
    }
  })
}
export default PermissionsManager
