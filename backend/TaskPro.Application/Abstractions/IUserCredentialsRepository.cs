using TaskPro.Domain.Users;

namespace TaskPro.Application.Abstractions;

public interface IUserCredentialsRepository
{
    Task<UserCredentials?> GetByUserIdAsync(UserId userId, CancellationToken ct);
    Task AddAsync(UserCredentials credentials, CancellationToken ct);
    Task UpdateAsync(UserCredentials credentials, CancellationToken ct);
}
