using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using TaskPro.Api.Contracts.Users;
using TaskPro.Application.Abstractions;
using TaskPro.Domain.Users;

namespace TaskPro.Api.Endpoints;

public static class MeEndpoints
{
    public static IEndpointRouteBuilder MapMeEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/me").WithTags("Me").RequireAuthorization();

        group.MapGet("", async (ClaimsPrincipal principal, IUserRepository users, CancellationToken ct) =>
        {
            var sub = principal.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? principal.FindFirstValue("sub");

            if (!Guid.TryParse(sub, out var userId))
            {
                return Results.Unauthorized();
            }

            var user = await users.GetByIdAsync(new UserId(userId), ct);
            return user is null
                ? Results.Unauthorized()
                : Results.Ok(new UserResponse(user.Id.Value, user.Email, user.DisplayName));
        });

        return app;
    }
}
