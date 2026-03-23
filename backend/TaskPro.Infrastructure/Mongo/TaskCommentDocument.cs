using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TaskPro.Infrastructure.Mongo;

public sealed class TaskCommentDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    public Guid TaskId { get; set; }
    public Guid AuthorUserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}
