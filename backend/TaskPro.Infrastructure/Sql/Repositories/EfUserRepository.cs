using Microsoft.EntityFrameworkCore;
using TaskPro.Application.Abstractions;
using TaskPro.Domain.Users;
using TaskPro.Infrastructure.Sql;

namespace TaskPro.Infrastructure.Sql.Repositories;

public sealed class EfUserRepository : IUserRepository
{
    private readonly TaskProDbContext _db;

    public EfUserRepository(TaskProDbContext db)
    {
        _db = db;
    }

    public Task<User?> GetByIdAsync(UserId id, CancellationToken ct) =>
        _db.Users.FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<User?> GetByEmailAsync(string email, CancellationToken ct) =>
        _db.Users.FirstOrDefaultAsync(x => x.Email == email, ct);

    public Task<IReadOnlyList<User>> ListAsync(int skip, int take, CancellationToken ct) =>
        _db.Users
            .OrderBy(x => x.DisplayName)
            .Skip(skip)
            .Take(take)
            .ToListAsync(ct)
            .ContinueWith(t => (IReadOnlyList<User>)t.Result, ct);

    public Task<int> CountAsync(CancellationToken ct) =>
        _db.Users.CountAsync(ct);

    public async Task AddAsync(User user, CancellationToken ct)
    {
        await _db.Users.AddAsync(user, ct);
    }

    Task IUserRepository.UpdateAsync(User user, CancellationToken ct)
    {
        _db.Users.Update(user);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(UserId id, CancellationToken ct)
    {
        var entity = await _db.Users.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null)
        {
            return;
        }

        _db.Users.Remove(entity);
    }
}
