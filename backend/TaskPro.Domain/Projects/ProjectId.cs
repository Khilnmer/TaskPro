using TaskPro.Domain.Common;

namespace TaskPro.Domain.Projects;

public sealed record ProjectId(Guid Value) : StronglyTypedId<Guid>(Value)
{
    public static ProjectId New() => new(Guid.NewGuid());
}
