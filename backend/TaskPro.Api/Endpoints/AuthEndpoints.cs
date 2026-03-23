using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using TaskPro.Api.Contracts.Auth;
using TaskPro.Application.Abstractions;
using TaskPro.Domain.Users;

namespace TaskPro.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/register", async (
            RegisterRequest request,
            IUserRepository users,
            IUserCredentialsRepository credentialsRepo,
            IPasswordHasher hasher,
            ITokenService tokenService,
            IUnitOfWork uow,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.DisplayName) || string.IsNullOrWhiteSpace(request.Password))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    [nameof(request.Email)] = string.IsNullOrWhiteSpace(request.Email) ? ["Email is required"] : [],
                    [nameof(request.DisplayName)] = string.IsNullOrWhiteSpace(request.DisplayName) ? ["DisplayName is required"] : [],
                    [nameof(request.Password)] = string.IsNullOrWhiteSpace(request.Password) ? ["Password is required"] : [],
                }.Where(kvp => kvp.Value.Length > 0).ToDictionary(kvp => kvp.Key, kvp => kvp.Value));
            }

            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            var existing = await users.GetByEmailAsync(normalizedEmail, ct);
            if (existing is not null)
            {
                return Results.Conflict(new { message = "El correo ya está registrado." });
            }

            var user = new User(UserId.New(), normalizedEmail, request.DisplayName.Trim());
            var creds = new UserCredentials(user.Id, hasher.Hash(request.Password));

            await users.AddAsync(user, ct);
            await credentialsRepo.AddAsync(creds, ct);

            try
            {
                await uow.SaveChangesAsync(ct);
            }
            catch (DbUpdateException)
            {
                return Results.Conflict(new { message = "El correo ya está registrado." });
            }

            var token = tokenService.CreateAccessToken(user);
            return Results.Ok(new AuthResponse(user.Id.Value, user.Email, user.DisplayName, token));
        });

        group.MapPost("/login", async (
            LoginRequest request,
            IUserRepository users,
            IUserCredentialsRepository credentialsRepo,
            IPasswordHasher hasher,
            ITokenService tokenService,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    [nameof(request.Email)] = string.IsNullOrWhiteSpace(request.Email) ? ["Email is required"] : [],
                    [nameof(request.Password)] = string.IsNullOrWhiteSpace(request.Password) ? ["Password is required"] : [],
                }.Where(kvp => kvp.Value.Length > 0).ToDictionary(kvp => kvp.Key, kvp => kvp.Value));
            }

            var email = request.Email.Trim().ToLowerInvariant();
            var user = await users.GetByEmailAsync(email, ct);
            if (user is null)
            {
                return Results.Unauthorized();
            }

            var creds = await credentialsRepo.GetByUserIdAsync(user.Id, ct);
            if (creds is null || !hasher.Verify(request.Password, creds.PasswordHash))
            {
                return Results.Unauthorized();
            }

            var token = tokenService.CreateAccessToken(user);
            return Results.Ok(new AuthResponse(user.Id.Value, user.Email, user.DisplayName, token));
        });

        return app;
    }
}
