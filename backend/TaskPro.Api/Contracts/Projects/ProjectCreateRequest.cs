namespace TaskPro.Api.Contracts.Projects;

public sealed record ProjectCreateRequest(string Name, string? Description, Guid OwnerUserId, int Urgency = 0, int Status = 0);
