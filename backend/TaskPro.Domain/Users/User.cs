using TaskPro.Domain.Common;

namespace TaskPro.Domain.Users;

public sealed class User : Entity<UserId>
{
    public User(UserId id, string email, string displayName) : base(id)
    {
        Email = email;
        DisplayName = displayName;
    }

    public string Email { get; private set; }
    public string DisplayName { get; private set; }

    public void Update(string email, string displayName)
    {
        Email = email;
        DisplayName = displayName;
    }
}
