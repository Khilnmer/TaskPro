using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using TaskPro.Api.Contracts.Comments;
using TaskPro.Application.Abstractions;
using TaskPro.Domain.Tasks;

namespace TaskPro.Api.Endpoints;

public static class CommentsEndpoints
{
    public static IEndpointRouteBuilder MapCommentsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/comments").WithTags("Comments").RequireAuthorization();

        group.MapGet("/by-task/{taskId:guid}", async (Guid taskId, int skip, int take, ITaskCommentStore store, CancellationToken ct) =>
        {
            take = take is <= 0 or > 200 ? 50 : take;
            skip = skip < 0 ? 0 : skip;

            var comments = await store.ListByTaskAsync(new TaskId(taskId), skip, take, ct);
            return Results.Ok(comments);
        });

        group.MapPost("", async (TaskCommentCreateRequest request, ITaskCommentStore store, CancellationToken ct) =>
        {
            if (request.TaskId == Guid.Empty || request.AuthorUserId == Guid.Empty || string.IsNullOrWhiteSpace(request.Content))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    [nameof(request.TaskId)] = request.TaskId == Guid.Empty ? ["TaskId is required"] : [],
                    [nameof(request.AuthorUserId)] = request.AuthorUserId == Guid.Empty ? ["AuthorUserId is required"] : [],
                    [nameof(request.Content)] = string.IsNullOrWhiteSpace(request.Content) ? ["Content is required"] : []
                }.Where(kvp => kvp.Value.Length > 0).ToDictionary(kvp => kvp.Key, kvp => kvp.Value));
            }

            await store.AddAsync(new TaskCommentCreateDto(request.TaskId, request.AuthorUserId, request.Content.Trim()), ct);
            return Results.Accepted();
        });

        return app;
    }
}
