using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using TaskPro.Api.Contracts.Tasks;
using TaskPro.Application.Abstractions;
using TaskPro.Domain.Projects;
using TaskPro.Domain.Tasks;
using System.Security.Claims;
using TaskPro.Domain.Users;

namespace TaskPro.Api.Endpoints;

public static class TasksEndpoints
{
    public static IEndpointRouteBuilder MapTasksEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/tasks").WithTags("Tasks").RequireAuthorization();

        group.MapGet("/by-project/{projectId:guid}", async (Guid projectId, int skip, int take, ITaskRepository repo, CancellationToken ct) =>
        {
            take = take is <= 0 or > 200 ? 50 : take;
            skip = skip < 0 ? 0 : skip;

            var tasks = await repo.ListByProjectAsync(new ProjectId(projectId), skip, take, ct);
            return Results.Ok(tasks.Select(t => new TaskResponse(
                t.Id.Value,
                t.ProjectId.Value,
                t.Title,
                t.Description,
                t.Priority,
                t.Status,
                t.DueDate,
                t.CreatedAt)));
        });

        group.MapGet("/{id:guid}", async (Guid id, ITaskRepository repo, CancellationToken ct) =>
        {
            var task = await repo.GetByIdAsync(new TaskId(id), ct);
            return task is null
                ? Results.NotFound()
                : Results.Ok(new TaskResponse(
                    task.Id.Value,
                    task.ProjectId.Value,
                    task.Title,
                    task.Description,
                    task.Priority,
                    task.Status,
                    task.DueDate,
                    task.CreatedAt));
        });

        group.MapPost("", async (TaskCreateRequest request, ITaskRepository repo, IUnitOfWork uow, CancellationToken ct) =>
        {
            if (request.ProjectId == Guid.Empty || string.IsNullOrWhiteSpace(request.Title))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    [nameof(request.ProjectId)] = request.ProjectId == Guid.Empty ? ["ProjectId is required"] : [],
                    [nameof(request.Title)] = string.IsNullOrWhiteSpace(request.Title) ? ["Title is required"] : []
                }.Where(kvp => kvp.Value.Length > 0).ToDictionary(kvp => kvp.Key, kvp => kvp.Value));
            }

            var task = new ProjectTask(
                TaskId.New(),
                new ProjectId(request.ProjectId),
                request.Title.Trim(),
                request.Description?.Trim(),
                request.Priority,
                request.Status,
                request.DueDate);

            await repo.AddAsync(task, ct);
            await uow.SaveChangesAsync(ct);

            return Results.Created($"/api/tasks/{task.Id.Value}", new TaskResponse(
                task.Id.Value,
                task.ProjectId.Value,
                task.Title,
                task.Description,
                task.Priority,
                task.Status,
                task.DueDate,
                task.CreatedAt));
        });

        // Project owner can edit full task details
        group.MapPut("/{id:guid}", async (
            Guid id,
            TaskUpdateRequest request,
            HttpContext http,
            ITaskRepository repo,
            IProjectRepository projects,
            IUnitOfWork uow,
            CancellationToken ct) =>
        {
            var task = await repo.GetByIdAsync(new TaskId(id), ct);
            if (task is null)
            {
                return Results.NotFound();
            }

            var project = await projects.GetByIdAsync(task.ProjectId, ct);
            if (project is null)
            {
                return Results.NotFound(new { Message = "Project not found" });
            }

            var userIdClaim = http.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? http.User.FindFirstValue("sub");
            if (!Guid.TryParse(userIdClaim, out var userId) || userId != project.OwnerUserId.Value)
            {
                return Results.Forbid();
            }

            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    [nameof(request.Title)] = ["Title is required"]
                });
            }

            task.Update(request.Title.Trim(), request.Description?.Trim(), request.Priority, request.Status, request.DueDate);
            await repo.UpdateAsync(task, ct);
            await uow.SaveChangesAsync(ct);

            return Results.Ok(new TaskResponse(
                task.Id.Value,
                task.ProjectId.Value,
                task.Title,
                task.Description,
                task.Priority,
                task.Status,
                task.DueDate,
                task.CreatedAt));
        });

        // Assigned user can change ONLY the status
        group.MapPut("/{id:guid}/status", async (
            Guid id,
            TaskStatusUpdateRequest request,
            HttpContext http,
            ITaskRepository repo,
            ITaskAssigneeRepository assignees,
            IUnitOfWork uow,
            CancellationToken ct) =>
        {
            var task = await repo.GetByIdAsync(new TaskId(id), ct);
            if (task is null)
            {
                return Results.NotFound();
            }

            var userIdClaim = http.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? http.User.FindFirstValue("sub");
            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                return Results.Forbid();
            }

            var isAssigned = await assignees.ExistsAsync(new TaskId(id), new UserId(userId), ct);
            if (!isAssigned)
            {
                return Results.Forbid();
            }

            var status = Enum.IsDefined(typeof(TaskPro.Domain.Tasks.TaskStatus), request.Status)
                ? (TaskPro.Domain.Tasks.TaskStatus)request.Status
                : task.Status;
            task.Update(task.Title, task.Description, task.Priority, status, task.DueDate);
            await repo.UpdateAsync(task, ct);
            await uow.SaveChangesAsync(ct);

            return Results.Ok(new TaskResponse(
                task.Id.Value,
                task.ProjectId.Value,
                task.Title,
                task.Description,
                task.Priority,
                task.Status,
                task.DueDate,
                task.CreatedAt));
        });

        group.MapDelete("/{id:guid}", async (Guid id, ITaskRepository repo, IUnitOfWork uow, CancellationToken ct) =>
        {
            await repo.DeleteAsync(new TaskId(id), ct);
            await uow.SaveChangesAsync(ct);
            return Results.NoContent();
        });

        return app;
    }
}
