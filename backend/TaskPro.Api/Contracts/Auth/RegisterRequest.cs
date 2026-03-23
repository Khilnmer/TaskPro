namespace TaskPro.Api.Contracts.Auth;

public sealed record RegisterRequest(string Email, string DisplayName, string Password);
