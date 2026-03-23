using Microsoft.EntityFrameworkCore;
using TaskPro.Application.Abstractions;
using TaskPro.Domain.Tasks;
using TaskPro.Domain.Users;
using TaskPro.Infrastructure.Sql;

namespace TaskPro.Infrastructure.Sql.Repositories;

public sealed class EfTaskAssigneeRepository : ITaskAssigneeRepository
{
    private readonly TaskProDbContext _db;

    public EfTaskAssigneeRepository(TaskProDbContext db)
    {
        _db = db;
    }

    public Task<bool> ExistsAsync(TaskId taskId, UserId userId, CancellationToken ct) =>
        _db.TaskAssignees.AnyAsync(x => x.TaskId == taskId && x.UserId == userId, ct);

    public async Task AddAsync(TaskAssignee assignee, CancellationToken ct)
    {
        await _db.TaskAssignees.AddAsync(assignee, ct);
    }

    public async Task RemoveAsync(TaskId taskId, UserId userId, CancellationToken ct)
    {
        var entity = await _db.TaskAssignees.FirstOrDefaultAsync(x => x.TaskId == taskId && x.UserId == userId, ct);
        if (entity is null)
        {
            return;
        }

        _db.TaskAssignees.Remove(entity);
    }

    public async Task<IReadOnlyList<UserId>> ListAssigneesAsync(TaskId taskId, CancellationToken ct)
    {
        var assignees = await _db.TaskAssignees
            .Where(x => x.TaskId == taskId)
            .Select(x => x.UserId)
            .ToListAsync(ct);

        return assignees;
    }
}
