using Microsoft.EntityFrameworkCore;
using TaskPro.Application.Abstractions;
using TaskPro.Domain.Users;
using TaskPro.Infrastructure.Sql;

namespace TaskPro.Infrastructure.Sql.Repositories;

public sealed class EfUserCredentialsRepository : IUserCredentialsRepository
{
    private readonly TaskProDbContext _db;

    public EfUserCredentialsRepository(TaskProDbContext db)
    {
        _db = db;
    }

    public Task<UserCredentials?> GetByUserIdAsync(UserId userId, CancellationToken ct) =>
        _db.UserCredentials.FirstOrDefaultAsync(x => x.UserId == userId, ct);

    public async Task AddAsync(UserCredentials credentials, CancellationToken ct)
    {
        await _db.UserCredentials.AddAsync(credentials, ct);
    }

    public Task UpdateAsync(UserCredentials credentials, CancellationToken ct)
    {
        _db.UserCredentials.Update(credentials);
        return Task.CompletedTask;
    }
}
