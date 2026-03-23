using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using TaskPro.Api.Contracts.Tasks;
using TaskPro.Application.Abstractions;
using TaskPro.Domain.Tasks;
using TaskPro.Domain.Users;

namespace TaskPro.Api.Endpoints;

public static class TaskAssigneesEndpoints
{
    public static IEndpointRouteBuilder MapTaskAssigneesEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/tasks/{taskId:guid}/assignees")
            .WithTags("TaskAssignees")
            .RequireAuthorization();

        group.MapGet("", async (Guid taskId, ITaskAssigneeRepository repo, CancellationToken ct) =>
        {
            var userIds = await repo.ListAssigneesAsync(new TaskId(taskId), ct);
            return Results.Ok(new TaskAssigneeResponse(taskId, userIds.Select(x => x.Value).ToList()));
        });

        group.MapPost("/{userId:guid}", async (
            Guid taskId,
            Guid userId,
            ITaskRepository tasks,
            IUserRepository users,
            ITaskAssigneeRepository repo,
            IUnitOfWork uow,
            CancellationToken ct) =>
        {
            var task = await tasks.GetByIdAsync(new TaskId(taskId), ct);
            if (task is null)
            {
                return Results.NotFound(new { Message = "Task not found" });
            }

            var user = await users.GetByIdAsync(new UserId(userId), ct);
            if (user is null)
            {
                return Results.NotFound(new { Message = "User not found" });
            }

            var exists = await repo.ExistsAsync(new TaskId(taskId), new UserId(userId), ct);
            if (exists)
            {
                return Results.Conflict(new { Message = "User already assigned to task" });
            }

            await repo.AddAsync(new TaskAssignee(Guid.NewGuid(), new TaskId(taskId), new UserId(userId)), ct);
            await uow.SaveChangesAsync(ct);

            var assignees = await repo.ListAssigneesAsync(new TaskId(taskId), ct);
            return Results.Ok(new TaskAssigneeResponse(taskId, assignees.Select(x => x.Value).ToList()));
        });

        group.MapDelete("/{userId:guid}", async (
            Guid taskId,
            Guid userId,
            ITaskAssigneeRepository repo,
            IUnitOfWork uow,
            CancellationToken ct) =>
        {
            await repo.RemoveAsync(new TaskId(taskId), new UserId(userId), ct);
            await uow.SaveChangesAsync(ct);

            var assignees = await repo.ListAssigneesAsync(new TaskId(taskId), ct);
            return Results.Ok(new TaskAssigneeResponse(taskId, assignees.Select(x => x.Value).ToList()));
        });

        return app;
    }
}
