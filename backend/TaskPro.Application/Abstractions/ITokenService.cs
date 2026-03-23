using TaskPro.Domain.Users;

namespace TaskPro.Application.Abstractions;

public interface ITokenService
{
    string CreateAccessToken(User user);
}
