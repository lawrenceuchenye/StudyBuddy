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
  role: "CREATOR" | null;
  joinedAt: string
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

@route("/channels")
@tag("Channels")
interface Channels {
  @post create(...ChannelCreate): Channel | Error;
  @get list(): PaginatedResource<Channel> | Error;
  @get read(@path id: string): SingleResource<Channel> | Error;
  @patch update(...ChannelUpdate): Channel | Error | PermissionsError;
  @delete delete(@path id: string): GenericResponse<200> | Error | PermissionsError;

  @route("/join")
  @post join(@path id: string): GenericResponse<200>;

  @route("/leave")
  @post leave(@path id: string): GenericResponse<200>;
}

@route("/channels/{channelId}")
@tag("Channels")
interface ChannelMembers {
  @route("/members")
  @get read(@path channelId: string, @path memberId: string): ChannelMember | NotFoundError;

  @route("/members")
  @get list(@path channelId: string): PaginatedResource<ChannelMember> | Error;

  @route("/profile")
  @get getProfile(@path channelId: string): ChannelMember | Error;

  @route("/members")
  @delete remove(@path channelId: string, @path memberId: string): ChannelMember | PermissionsError | Error;

  @route("/members")
  @patch update(@path channelId: string, @path memberId: string, ...ChannelMemberUpdate): ChannelMember | PermissionsError | Error;

}
