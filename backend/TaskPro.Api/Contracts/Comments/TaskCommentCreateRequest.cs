namespace TaskPro.Api.Contracts.Comments;

public sealed record TaskCommentCreateRequest(Guid TaskId, Guid AuthorUserId, string Content);
