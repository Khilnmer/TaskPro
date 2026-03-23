using TaskPro.Domain.Tasks;

namespace TaskPro.Api.Contracts.Tasks;

public sealed record TaskUpdateRequest(
    string Title,
    string? Description,
    TaskPriority Priority,
    TaskPro.Domain.Tasks.TaskStatus Status,
    DateTimeOffset? DueDate);
