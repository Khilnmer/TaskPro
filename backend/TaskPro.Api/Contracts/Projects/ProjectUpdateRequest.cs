namespace TaskPro.Api.Contracts.Projects;

public sealed record ProjectUpdateRequest(string Name, string? Description, int Urgency, int Status);
