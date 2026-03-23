using TaskPro.Domain.Common;

namespace TaskPro.Domain.Users;

public sealed record UserId(Guid Value) : StronglyTypedId<Guid>(Value)
{
    public static UserId New() => new(Guid.NewGuid());
}
