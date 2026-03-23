using Microsoft.EntityFrameworkCore;
using TaskPro.Application.Abstractions;
using TaskPro.Domain.Projects;
using TaskPro.Domain.Tasks;
using TaskPro.Infrastructure.Sql;

namespace TaskPro.Infrastructure.Sql.Repositories;

public sealed class EfTaskRepository : ITaskRepository
{
    private readonly TaskProDbContext _db;

    public EfTaskRepository(TaskProDbContext db)
    {
        _db = db;
    }

    public Task<ProjectTask?> GetByIdAsync(TaskId id, CancellationToken ct) =>
        _db.Tasks.FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<IReadOnlyList<ProjectTask>> ListByProjectAsync(ProjectId projectId, int skip, int take, CancellationToken ct) =>
        _db.Tasks
            .Where(x => x.ProjectId == projectId)
            .OrderByDescending(x => x.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync(ct)
            .ContinueWith(t => (IReadOnlyList<ProjectTask>)t.Result, ct);

    public async Task AddAsync(ProjectTask task, CancellationToken ct)
    {
        await _db.Tasks.AddAsync(task, ct);
    }

    public Task UpdateAsync(ProjectTask task, CancellationToken ct)
    {
        _db.Tasks.Update(task);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(TaskId id, CancellationToken ct)
    {
        var entity = await _db.Tasks.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null)
        {
            return;
        }

        _db.Tasks.Remove(entity);
    }
}
