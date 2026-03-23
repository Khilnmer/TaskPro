using TaskPro.Domain.Tasks;
using TaskPro.Domain.Users;

namespace TaskPro.Application.Abstractions;

public interface ITaskAssigneeRepository
{
    Task<bool> ExistsAsync(TaskId taskId, UserId userId, CancellationToken ct);
    Task AddAsync(TaskAssignee assignee, CancellationToken ct);
    Task RemoveAsync(TaskId taskId, UserId userId, CancellationToken ct);
    Task<IReadOnlyList<UserId>> ListAssigneesAsync(TaskId taskId, CancellationToken ct);
}
