using Microsoft.EntityFrameworkCore;
using TaskPro.Application.Abstractions;
using TaskPro.Domain.Projects;
using TaskPro.Infrastructure.Sql;

namespace TaskPro.Infrastructure.Sql.Repositories;

public sealed class EfProjectRepository : IProjectRepository
{
    private readonly TaskProDbContext _db;

    public EfProjectRepository(TaskProDbContext db)
    {
        _db = db;
    }

    public Task<Project?> GetByIdAsync(ProjectId id, CancellationToken ct) =>
        _db.Projects.FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<IReadOnlyList<Project>> ListAsync(int skip, int take, CancellationToken ct) =>
        _db.Projects
            .OrderBy(x => x.Name)
            .Skip(skip)
            .Take(take)
            .ToListAsync(ct)
            .ContinueWith(t => (IReadOnlyList<Project>)t.Result, ct);

    public async Task AddAsync(Project project, CancellationToken ct)
    {
        await _db.Projects.AddAsync(project, ct);
    }

    public Task UpdateAsync(Project project, CancellationToken ct)
    {
        _db.Projects.Update(project);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(ProjectId id, CancellationToken ct)
    {
        var entity = await _db.Projects.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null)
        {
            return;
        }

        _db.Projects.Remove(entity);
    }
}
