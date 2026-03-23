namespace TaskPro.Api.Contracts.Tasks;

public sealed record TaskAssigneeResponse(Guid TaskId, IReadOnlyList<Guid> UserIds);
