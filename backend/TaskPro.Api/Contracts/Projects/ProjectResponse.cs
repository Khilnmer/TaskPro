namespace TaskPro.Api.Contracts.Projects;

public sealed record ProjectResponse(Guid Id, string Name, string? Description, Guid OwnerUserId, int Urgency, int Status);
