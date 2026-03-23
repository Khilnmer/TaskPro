using TaskPro.Domain.Projects;
using TaskPro.Domain.Tasks;

namespace TaskPro.Application.Abstractions;

public interface ITaskRepository
{
    Task<ProjectTask?> GetByIdAsync(TaskId id, CancellationToken ct);
    Task<IReadOnlyList<ProjectTask>> ListByProjectAsync(ProjectId projectId, int skip, int take, CancellationToken ct);
    Task AddAsync(ProjectTask task, CancellationToken ct);
    Task UpdateAsync(ProjectTask task, CancellationToken ct);
    Task DeleteAsync(TaskId id, CancellationToken ct);
}
