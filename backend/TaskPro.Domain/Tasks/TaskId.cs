using TaskPro.Domain.Common;

namespace TaskPro.Domain.Tasks;

public sealed record TaskId(Guid Value) : StronglyTypedId<Guid>(Value)
{
    public static TaskId New() => new(Guid.NewGuid());
}
