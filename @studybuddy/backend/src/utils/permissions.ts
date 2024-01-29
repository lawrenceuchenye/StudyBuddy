import { defineAbility, subject as caslAbility } from '@casl/ability';
import { IChannel, IChannelMessage, IChannelUser } from '../models/channel';
import { HydratedDocument } from 'mongoose';
import { IStudyGroup, IStudyGroupUser } from '../models/study-group';
import { IUser } from '../models/user';
import { IResource } from '../models/resource';

namespace PermissionsManager {
  export const subject = caslAbility

  type ChannelProps = {
    user: HydratedDocument<IChannelUser>
    channel: HydratedDocument<IChannel>
  }

  export const Channel = ({ user, channel }: ChannelProps) => defineAbility(can => {
    if (user.channelId.equals(channel._id)) {
      if (user.role === "CREATOR") {
        can<IChannelUser>('promote', 'ChannelUser', { channelId: channel._id })
        can<IChannelUser>('remove', 'ChannelUser', { channelId: channel._id })

        can('update', 'Channel')
        can('delete', 'Channel')

        can('post', 'ChannelMessage')
        can('delete', "ChannelMessage")
      }
      else if (user.role === "TUTOR") {
        can('post', 'ChannelMessage', { senderId: user._id })
        can('delete', "ChannelMessage", { senderId: user._id })
      }
    }
  })

  type StudyGroupProps = {
    user: HydratedDocument<IStudyGroupUser>
    studyGroup: HydratedDocument<IStudyGroup>
  }

  export const StudyGroup = ({ user, studyGroup }: StudyGroupProps) => defineAbility(can => {
    if (user.studyGroupId.equals(studyGroup._id)) {
      if (user.role === "CREATOR") {
        can<IStudyGroupUser>('add', 'StudyGroupUser')
        can<IStudyGroupUser>('remove', 'StudyGroupUser', { studyGroupId: studyGroup._id })

        can('update', 'StudyGroup')
        can('delete', 'StudyGroup')

        can('post', 'StudyGroupMessage')
        can('delete', "StudyGroupMessage")
      }

      can('post', 'StudyGroupMessage', { senderId: user._id })
      can('delete', "StudyGroupMessage", { senderId: user._id })
    }
  })

  type ResourceProps = {
    user: HydratedDocument<IUser>
    resource: HydratedDocument<IResource>
  }

  export const Resource = ({ user, resource }: ResourceProps) => defineAbility(can => {
    if (resource.creatorId.equals(user._id)) {
      can<IResource>("update", "Resource")
    }
  })
}

export default PermissionsManager
