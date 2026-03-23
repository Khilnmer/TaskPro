using TaskPro.Domain.Common;
using TaskPro.Domain.Users;

namespace TaskPro.Domain.Tasks;

public sealed class TaskAssignee : Entity<Guid>
{
    public TaskAssignee(Guid id, TaskId taskId, UserId userId) : base(id)
    {
        TaskId = taskId;
        UserId = userId;
    }

    public TaskId TaskId { get; private set; }
    public UserId UserId { get; private set; }
}
