using TaskPro.Application.Abstractions;

namespace TaskPro.Infrastructure.Sql;

public sealed class EfUnitOfWork : IUnitOfWork
{
    private readonly TaskProDbContext _db;

    public EfUnitOfWork(TaskProDbContext db)
    {
        _db = db;
    }

    public Task<int> SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}
