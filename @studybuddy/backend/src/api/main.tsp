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

model ChannelMemberUpdate {
  trustFundId?: string | null
}

@route("/channels")
@tag("Channels")
interface ChannelCollection {
  @post create(...ChannelCreate): Channel | Error;
  @get list(): PaginatedResource<Channel> | Error;
  @get read(@path id: string): SingleResource<Channel> | Error;
  @patch update(...ChannelUpdate): Channel | Error | PermissionsError;
  @delete delete(@path id: string): GenericResponse<200> | Error | PermissionsError;
}

model ChannelMember {
  id: string;
  channelId: string;
  role: "CREATOR" | "TUTOR" | null;
  joinedAt: string
}

@route("/channels/{id}/members")
@tag("Channels")
interface ChannelMemberCollection {
  @route("/join")
  @post join(@path id: string): GenericResponse<200> | NotFoundError | GenericError;

  @route("/leave")
  @post leave(@path id: string): GenericResponse<200> | NotFoundError | GenericError;

  @get read(@path id: string, @path memberId: string): ChannelMember | NotFoundError | GenericError;

  @get list(@path id: string): PaginatedResource<ChannelMember> | Error;

  @route("/profile")
  @get getProfile(@path id: string): ChannelMember | Error;

  @route("/{memberId}/promote")
  @post promote(@path id: string, @path memberId: string): ChannelMember | PermissionsError | Error;

  @route("/{memberId}/demote")
  @post demote(@path id: string, @path memberId: string): ChannelMember | PermissionsError | Error;

  @route("/profile")
  @patch update(@path id: string, ...ChannelMemberUpdate): ChannelMember | PermissionsError | Error;

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
interface ChannelMessageCollection {
  @post send(@path id: string, ...ChannelMessageSend): GenericResponse<200> | NotFoundError | PermissionsError | GenericError;
  @get list(@path id: string): PaginatedResource<ChannelMessage> | PermissionsError | GenericError;
  @patch update(@path id: string, @path messageId: string): GenericResponse<200> | PermissionsError | GenericError;
  @delete delete(@path id: string, @path messageId: string): GenericResponse<200> | PermissionsError | GenericError;
}

model StudyGroupCreate {
  name: string;
  description: string;
  subjects: string[]
}

model StudyGroup {
  id: string;
  name: string;
  description: string;
  subjects: string[];
  creatorId: string;
  createdAt: string;
}

@route("/study-groups/")
@tag("StudyGroup")
interface StudyGroupCollection {
  @post create(...StudyGroupCreate): StudyGroup | Error;
  @get list(): PaginatedResource<StudyGroup> | Error;
  @get read(@path id: string): SingleResource<StudyGroup> | Error;
  @patch update(...ChannelUpdate): StudyGroup | Error | PermissionsError;
  @delete delete(@path id: string): GenericResponse<200> | Error | PermissionsError;
}

model StudyGroupMember {
  id: string;
  channelId: string;
  role: "CREATOR" | null;
  joinedAt: string
}

@route("/study-groups/{id}/members")
@tag("StudyGroup")
interface StudyGroupMemberCollection {
  @post join(@path id: string): GenericResponse<200> | NotFoundError | GenericError;

  @route("/leave")
  @post leave(@path id: string): GenericResponse<200> | NotFoundError | GenericError;

  @get read(@path id: string, @path memberId: string): StudyGroupMember | NotFoundError | GenericError;

  @get list(@path id: string): PaginatedResource<StudyGroupMember> | Error;

  @route("/profile")
  @get getProfile(@path id: string): StudyGroupMember | Error;
  
  @delete remove(@path id: string, @path memberId: string): StudyGroupMember | PermissionsError | Error;
}

model StudyGroupMessageSend {
  content: string;
  mediaIds: string[]
}

model StudyGroupMessage {
  id: string;
  mediaIds: string;
  senderId: string;
  channelId: string;
  deleted: boolean;
  sentAt: string;
}

@route("/study-groups/{id}/messages")
@tag("StudyGroup")
interface StudyGroupMessageCollection {
  @post send(@path id: string, ...StudyGroupMessageSend): GenericResponse<200> | NotFoundError | PermissionsError | GenericError;
  @get list(@path id: string): PaginatedResource<StudyGroupMessage> | PermissionsError | GenericError;
  @patch update(@path id: string, @path messageId: string): GenericResponse<200> | PermissionsError | GenericError;
  @delete delete(@path id: string, @path messageId: string): GenericResponse<200> | PermissionsError | GenericError;
}

model MediaCreatedResponse {
  id: string
}

model MediaMeta {
  name: string;
  type: string;
  size: int64;
  uploadedAt: string;
}

model Media {
  @header contentType: "application/octet-stream";
  @body _: bytes;
}

@route("/media")
@tag("Media")
interface MediaCollection {
  @post create(@header contentType: "application/octet-stream", @body media: bytes): MediaCreatedResponse | GenericError;

  @get download(@path id: string): Media | GenericError;

  @route("/{id}/meta")
  @get readMeta(@path id: string): MediaMeta | NotFoundError | GenericError;
}

model ResourceCreate {
  title: string;
  shortDescription: string;
  longDescription: string;
  subjects: string[];
  mediaIds: string[];
}

model Resource extends ResourceCreate {
  creatorId: string;
  createdAt: string;
}

@route("/resources")
@tag("Resource")
interface ResourceCollection {
  @post create(...ResourceCreate): SingleResource<Resource> | Error;
  @get read(@path id: string): SingleResource<Resource> | GenericError;
  @get list(): PaginatedResource<Resource> | GenericError;
  @patch update(@path id: string): SingleResource<Resource> | PermissionsError | NotFoundError | Error;
  @delete delete(@path id: string): GenericResponse<200> | PermissionsError | NotFoundError | Error;
}

model TrustFundCreate {
  name: string;
  shortDescription: string;
  longDescription: string;
  balance: int64;
  logoId: string;
  accountDetails: {
    bankCode: string;
    number: string;
  };
}

model TrustFund extends TrustFundCreate {
  creatorId: string;
  createdAt: string;
}

model TrustFundUpdate is OptionalProperties<TrustFundCreate>;

model TrustFundPayment {
  url: url
}

@route("/trust-funds")
@tag("TrustFund")
interface TrustFundCollection {
  @post create(...TrustFundCreate): SingleResource<TrustFund> | Error;
  @get read(@path id: string): SingleResource<TrustFund> | NotFoundError | GenericError;
  @get list(): PaginatedResource<TrustFund> | GenericError;

  @route("/{id}/deposit")
  @post deposit(@path id: string, amount: int64): SingleResource<TrustFundPayment> | NotFoundError | Error;

  @route("/{id}/withdraw")
  @post withdraw(@path id: string): SingleResource<TrustFundPayment> | NotFoundError | PermissionsError | GenericError;

  @patch update(@path id: string, ...TrustFundUpdate): GenericResponse<200> | PermissionsError | NotFoundError | Error;
  @delete delete(@path id: string): GenericResponse<200> | PermissionsError | NotFoundError | Error;
}

model TutorProfileCreate {
  name: string;
  trustFundId: string;
}

model TutorProfileUpdate is OptionalProperties<TutorProfileCreate>;

model ListTutorsFilters {
  @query page: int64;
  @query perPage: int64;
  @query name?: string;
}

model TutorProfile extends TutorProfileCreate {
  joinedAt: string
}

@route("/tutors")
@tag("Tutor")
interface TutorCollection {
  @post create(...TutorProfileCreate): SingleResource<TutorProfile> | Error;

  @get read(@path id: string): SingleResource<TutorProfile> | NotFoundError | GenericError;
  @get list(...ListTutorsFilters): PaginatedResource<TutorProfile> | GenericError;

  @patch update(@path id: string, ...TutorProfileUpdate): GenericResponse<200> | PermissionsError | Error;
  @delete delete(@path id: string): GenericResponse<200> | PermissionsError | Error;
}


model PostCreate {
  title: string;
  tags: string[];
  content: string;
}

model PostUpdate is OptionalProperties<PostCreate>;

model ListPostsFilters {
  @query page: int64;
  @query perPage: int64;
  @query name?: string;
  @query title?: string;
  @query({ format: "multi" }) tags?: string[];
  @query content?: string;
  @query authorId?: string;
  @query isPublished?: boolean;
  @query createdBefore?: string;
  @query createdAfter?: string;
  @query publishedBefore?: string;
  @query publishedAfter?: string;
}

model Post extends PostCreate {
  joinedAt: string;
}

@route("/posts")
@tag("Post")
interface PostCollection {
  @post create(...PostCreate): SingleResource<Post> | Error;

  @get read(@path id: string): SingleResource<Post> | NotFoundError | GenericError;
  @get list(...ListPostsFilters): PaginatedResource<Post> | GenericError;

  @patch update(@path id: string, ...PostUpdate): GenericResponse<200> | PermissionsError | Error;
  @delete delete(@path id: string): GenericResponse<200> | PermissionsError | Error;
}
