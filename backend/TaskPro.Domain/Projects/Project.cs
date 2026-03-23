using TaskPro.Domain.Common;
using TaskPro.Domain.Users;

namespace TaskPro.Domain.Projects;

public sealed class Project : Entity<ProjectId>
{
    public Project(ProjectId id, string name, string? description, UserId ownerUserId) : base(id)
    {
        Name = name;
        Description = description;
        OwnerUserId = ownerUserId;
        Urgency = 0;
        Status = ProjectStatus.Active;
    }

    public string Name { get; private set; }
    public string? Description { get; private set; }
    public UserId OwnerUserId { get; private set; }
    public int Urgency { get; private set; }
    public ProjectStatus Status { get; private set; }

    public void Update(string name, string? description)
    {
        Name = name;
        Description = description;
    }

    public void Update(string name, string? description, int urgency, ProjectStatus status)
    {
        Name = name;
        Description = description;
        Urgency = urgency;
        Status = status;
    }
}
