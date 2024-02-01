import "@typespec/http";

using TypeSpec.Http;

@useAuth(BearerAuth)
@service({
  title: "Studybuddy",
  version: "0.0.1",
})
@server("https://studybuddy.com", "Studybuddy server endpoint")
namespace Studybuddy;

model PaginatedResource<T> {
  data: T[],
  meta: {
    page: int64,
    perPage: int64
  }
}

model SingleResource<T> {
  data: T
}

model ZodError {
  path: string[];
  message: string
}

model GenericResponse<C> {
  @statusCode statusCode: C;

  message: string
}

@error
model GenericError {
  @statusCode statusCode: 500,

  message: string;
  error: unknown
}

@error
model NotFoundError {
  @statusCode statusCode: 404,

  message: string;
}

@error
model BadRequestError {
  @statusCode statusCode: 400,
  
  error: ZodError[];
}

@error
model PermissionsError {
  @statusCode statusCode: 403;

  error: string
}

alias Error = BadRequestError | GenericError;

model Channel {
  id: string;
  name: string;
  description: string;
  subjects: string[];
  creatorId: string;
  createdAt: string;
}

model ChannelCreate {
  name: string;
  description: string;
  subjects: string[]
}

model ChannelUpdate {
  name?: string;
  description?: string;
  subjects?: string[]
}

model ChannelMember {
  id: string;
  channelId: string;
  role: "CREATOR" | "TUTOR" | null;
  joinedAt: string
}

model ChannelMemberUpdate {
  role: "TUTOR" | null
}

@route("/channels")
@tag("Channels")
interface Channels {
  @post create(...ChannelCreate): Channel | Error;
  @get list(): PaginatedResource<Channel> | Error;
  @get read(@path id: string): SingleResource<Channel> | Error;
  @patch update(...ChannelUpdate): Channel | Error | PermissionsError;
  @delete delete(@path id: string): GenericResponse<200> | Error | PermissionsError;
}

@route("/channels/{id}/members")
@tag("Channels")
interface ChannelMembers {
  @route("/join")
  @post join(@path id: string): GenericResponse<200> | NotFoundError | GenericError;

  @route("/leave")
  @post leave(@path id: string): GenericResponse<200> | NotFoundError | GenericError;

  @get read(@path id: string, @path memberId: string): ChannelMember | NotFoundError | GenericError;

  @get list(@path id: string): PaginatedResource<ChannelMember> | Error;

  @route("/profile")
  @get getProfile(@path id: string): ChannelMember | Error;

  @patch update(@path id: string, @path memberId: string, ...ChannelMemberUpdate): ChannelMember | PermissionsError | Error;

  @delete remove(@path id: string, @path memberId: string): ChannelMember | PermissionsError | Error;
}

model ChannelMessageSend {
  content: string;
  mediaIds: string[]
}

model ChannelMessage {
  id: string;
  mediaIds: string;
  senderId: string;
  channelId: string;
  deleted: boolean;
  sentAt: string;
}

@route("/channels/{id}/messages")
@tag("Channels")
interface ChannelMessages {
  @post send(@path id: string, ...ChannelMessageSend): GenericResponse<200> | NotFoundError | PermissionsError | GenericError;
  @get list(@path id: string): PaginatedResource<ChannelMessage> | PermissionsError | GenericError;
  @patch update(@path id: string, @path messageId: string): GenericResponse<200> | PermissionsError | GenericError;
  @delete delete(@path id: string, @path messageId: string): GenericResponse<200> | PermissionsError | GenericError;
}

