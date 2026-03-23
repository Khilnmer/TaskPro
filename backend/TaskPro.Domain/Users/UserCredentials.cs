namespace TaskPro.Domain.Users;

public sealed class UserCredentials
{
    public UserCredentials(UserId userId, string passwordHash)
    {
        UserId = userId;
        PasswordHash = passwordHash;
    }

    public UserId UserId { get; private set; }
    public string PasswordHash { get; private set; }

    public void UpdatePasswordHash(string passwordHash)
    {
        PasswordHash = passwordHash;
    }
}
