using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using TaskPro.Api.Contracts.Users;
using TaskPro.Application.Abstractions;
using TaskPro.Domain.Users;

namespace TaskPro.Api.Endpoints;

public static class UsersEndpoints
{
    public static IEndpointRouteBuilder MapUsersEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/users").WithTags("Users").RequireAuthorization();

        group.MapGet("", async (int skip, int take, IUserRepository repo, CancellationToken ct) =>
        {
            take = take is <= 0 or > 200 ? 50 : take;
            skip = skip < 0 ? 0 : skip;

            var users = await repo.ListAsync(skip, take, ct);
            return Results.Ok(users.Select(u => new UserResponse(u.Id.Value, u.Email, u.DisplayName)));
        });

        group.MapGet("/count", async (IUserRepository repo, CancellationToken ct) =>
        {
            var count = await repo.CountAsync(ct);
            return Results.Ok(new { Count = count });
        });

        group.MapGet("/{id:guid}", async (Guid id, IUserRepository repo, CancellationToken ct) =>
        {
            var user = await repo.GetByIdAsync(new UserId(id), ct);
            return user is null
                ? Results.NotFound()
                : Results.Ok(new UserResponse(user.Id.Value, user.Email, user.DisplayName));
        });

        group.MapPost("", async (UserCreateRequest request, IUserRepository repo, IUnitOfWork uow, CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.DisplayName))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    [nameof(request.Email)] = ["Email is required"],
                    [nameof(request.DisplayName)] = ["DisplayName is required"]
                });
            }

            var user = new User(UserId.New(), request.Email.Trim().ToLowerInvariant(), request.DisplayName.Trim());
            await repo.AddAsync(user, ct);
            await uow.SaveChangesAsync(ct);

            return Results.Created($"/api/users/{user.Id.Value}", new UserResponse(user.Id.Value, user.Email, user.DisplayName));
        });

        group.MapPut("/{id:guid}", async (Guid id, UserUpdateRequest request, IUserRepository repo, IUnitOfWork uow, CancellationToken ct) =>
        {
            var user = await repo.GetByIdAsync(new UserId(id), ct);
            if (user is null)
            {
                return Results.NotFound();
            }

            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.DisplayName))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    [nameof(request.Email)] = ["Email is required"],
                    [nameof(request.DisplayName)] = ["DisplayName is required"]
                });
            }

            user.Update(request.Email.Trim().ToLowerInvariant(), request.DisplayName.Trim());
            await repo.UpdateAsync(user, ct);
            await uow.SaveChangesAsync(ct);

            return Results.Ok(new UserResponse(user.Id.Value, user.Email, user.DisplayName));
        });

        group.MapDelete("/{id:guid}", async (Guid id, IUserRepository repo, IUnitOfWork uow, CancellationToken ct) =>
        {
            await repo.DeleteAsync(new UserId(id), ct);
            await uow.SaveChangesAsync(ct);
            return Results.NoContent();
        });

        return app;
    }
}
