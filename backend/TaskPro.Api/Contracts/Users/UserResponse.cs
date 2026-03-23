namespace TaskPro.Api.Contracts.Users;

public sealed record UserResponse(Guid Id, string Email, string DisplayName);
