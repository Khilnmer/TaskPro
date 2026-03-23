using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using TaskPro.Api.Contracts.Projects;
using TaskPro.Application.Abstractions;
using TaskPro.Domain.Projects;
using TaskPro.Domain.Users;
using System.Security.Claims;

namespace TaskPro.Api.Endpoints;

public static class ProjectsEndpoints
{
    public static IEndpointRouteBuilder MapProjectsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/projects").WithTags("Projects").RequireAuthorization();

        group.MapGet("", async (int skip, int take, IProjectRepository repo, CancellationToken ct) =>
        {
            take = take is <= 0 or > 200 ? 50 : take;
            skip = skip < 0 ? 0 : skip;

            var projects = await repo.ListAsync(skip, take, ct);
            return Results.Ok(projects.Select(p => new ProjectResponse(p.Id.Value, p.Name, p.Description, p.OwnerUserId.Value, p.Urgency, (int)p.Status)));
        });

        group.MapGet("/{id:guid}", async (Guid id, IProjectRepository repo, CancellationToken ct) =>
        {
            var project = await repo.GetByIdAsync(new ProjectId(id), ct);
            return project is null
                ? Results.NotFound()
                : Results.Ok(new ProjectResponse(project.Id.Value, project.Name, project.Description, project.OwnerUserId.Value, project.Urgency, (int)project.Status));
        });

        group.MapPost("", async (ProjectCreateRequest request, IProjectRepository repo, IUnitOfWork uow, CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    [nameof(request.Name)] = ["Name is required"]
                });
            }

            var urgency = request.Urgency is < 0 or > 2 ? 0 : request.Urgency;
            var status = Enum.IsDefined(typeof(ProjectStatus), request.Status) ? (ProjectStatus)request.Status : ProjectStatus.Active;

            var project = new Project(ProjectId.New(), request.Name.Trim(), request.Description?.Trim(), new UserId(request.OwnerUserId));
            project.Update(project.Name, project.Description, urgency, status);
            await repo.AddAsync(project, ct);
            await uow.SaveChangesAsync(ct);

            return Results.Created($"/api/projects/{project.Id.Value}", new ProjectResponse(project.Id.Value, project.Name, project.Description, project.OwnerUserId.Value, project.Urgency, (int)project.Status));
        });

        group.MapPut("/{id:guid}", async (Guid id, ProjectUpdateRequest request, HttpContext http, IProjectRepository repo, IUnitOfWork uow, CancellationToken ct) =>
        {
            var project = await repo.GetByIdAsync(new ProjectId(id), ct);
            if (project is null)
            {
                return Results.NotFound();
            }

            // Only the owner can modify the project
            var userIdClaim = http.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? http.User.FindFirstValue("sub");
            if (!Guid.TryParse(userIdClaim, out var userId) || userId != project.OwnerUserId.Value)
            {
                return Results.Forbid();
            }

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    [nameof(request.Name)] = ["Name is required"]
                });
            }

            var urgency = request.Urgency is < 0 or > 2 ? project.Urgency : request.Urgency;
            var status = Enum.IsDefined(typeof(ProjectStatus), request.Status) ? (ProjectStatus)request.Status : project.Status;

            project.Update(request.Name.Trim(), request.Description?.Trim(), urgency, status);
            await repo.UpdateAsync(project, ct);
            await uow.SaveChangesAsync(ct);

            return Results.Ok(new ProjectResponse(project.Id.Value, project.Name, project.Description, project.OwnerUserId.Value, project.Urgency, (int)project.Status));
        });

        group.MapDelete("/{id:guid}", async (Guid id, IProjectRepository repo, IUnitOfWork uow, CancellationToken ct) =>
        {
            await repo.DeleteAsync(new ProjectId(id), ct);
            await uow.SaveChangesAsync(ct);
            return Results.NoContent();
        });

        return app;
    }
}
