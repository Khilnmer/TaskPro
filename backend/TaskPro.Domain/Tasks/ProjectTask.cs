using TaskPro.Domain.Common;
using TaskPro.Domain.Projects;

namespace TaskPro.Domain.Tasks;

public sealed class ProjectTask : Entity<TaskId>
{
    public ProjectTask(
        TaskId id,
        ProjectId projectId,
        string title,
        string? description,
        TaskPriority priority,
        TaskStatus status,
        DateTimeOffset? dueDate) : base(id)
    {
        ProjectId = projectId;
        Title = title;
        Description = description;
        Priority = priority;
        Status = status;
        DueDate = dueDate;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public ProjectId ProjectId { get; private set; }
    public string Title { get; private set; }
    public string? Description { get; private set; }
    public TaskPriority Priority { get; private set; }
    public TaskStatus Status { get; private set; }
    public DateTimeOffset? DueDate { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    public void Update(string title, string? description, TaskPriority priority, TaskStatus status, DateTimeOffset? dueDate)
    {
        Title = title;
        Description = description;
        Priority = priority;
        Status = status;
        DueDate = dueDate;
    }
}
