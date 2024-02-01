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
model BadRequestError {
  @statusCode statusCode: 400,
  
  error: ZodError[];
}

alias Error = BadRequestError | GenericError;

@route("/channels")
@tag("Channels")
interface Widgets {
  @post create(...ChannelCreate): Channel | Error;
  @get list(): PaginatedResource<Channel> | Error;
  @get read(@path id: string): SingleResource<Channel> | Error;
  @patch update(...ChannelUpdate): Channel | Error;
  @delete delete(@path id: string): GenericResponse<200> | Error;
}
