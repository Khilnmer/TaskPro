using TaskPro.Domain.Tasks;

namespace TaskPro.Application.Abstractions;

public interface ITaskCommentStore
{
    Task<IReadOnlyList<TaskCommentDto>> ListByTaskAsync(TaskId taskId, int skip, int take, CancellationToken ct);
    Task AddAsync(TaskCommentCreateDto comment, CancellationToken ct);
}

public sealed record TaskCommentDto(
    string Id,
    Guid TaskId,
    Guid AuthorUserId,
    string Content,
    DateTimeOffset CreatedAt);

public sealed record TaskCommentCreateDto(
    Guid TaskId,
    Guid AuthorUserId,
    string Content);
