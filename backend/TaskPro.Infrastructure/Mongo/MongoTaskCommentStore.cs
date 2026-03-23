using Microsoft.Extensions.Options;
using MongoDB.Driver;
using TaskPro.Application.Abstractions;
using TaskPro.Domain.Tasks;

namespace TaskPro.Infrastructure.Mongo;

public sealed class MongoTaskCommentStore : ITaskCommentStore
{
    private readonly IMongoCollection<TaskCommentDocument> _collection;

    public MongoTaskCommentStore(IMongoClient client, IOptions<MongoOptions> options)
    {
        var o = options.Value;
        var db = client.GetDatabase(o.Database);
        _collection = db.GetCollection<TaskCommentDocument>(o.TaskCommentsCollection);
    }

    public async Task<IReadOnlyList<TaskCommentDto>> ListByTaskAsync(TaskId taskId, int skip, int take, CancellationToken ct)
    {
        var id = taskId.Value;

        var docs = await _collection
            .Find(x => x.TaskId == id)
            .SortByDescending(x => x.CreatedAt)
            .Skip(skip)
            .Limit(take)
            .ToListAsync(ct);

        return docs
            .Select(x => new TaskCommentDto(x.Id, x.TaskId, x.AuthorUserId, x.Content, x.CreatedAt))
            .ToList();
    }

    public Task AddAsync(TaskCommentCreateDto comment, CancellationToken ct)
    {
        var doc = new TaskCommentDocument
        {
            TaskId = comment.TaskId,
            AuthorUserId = comment.AuthorUserId,
            Content = comment.Content,
            CreatedAt = DateTimeOffset.UtcNow
        };

        return _collection.InsertOneAsync(doc, cancellationToken: ct);
    }
}
