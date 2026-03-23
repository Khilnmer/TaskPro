using TaskPro.Domain.Tasks;

namespace TaskPro.Api.Contracts.Tasks;

public sealed record TaskResponse(
    Guid Id,
    Guid ProjectId,
    string Title,
    string? Description,
    TaskPriority Priority,
    TaskPro.Domain.Tasks.TaskStatus Status,
    DateTimeOffset? DueDate,
    DateTimeOffset CreatedAt);
