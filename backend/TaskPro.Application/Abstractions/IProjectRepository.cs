using TaskPro.Domain.Projects;

namespace TaskPro.Application.Abstractions;

public interface IProjectRepository
{
    Task<Project?> GetByIdAsync(ProjectId id, CancellationToken ct);
    Task<IReadOnlyList<Project>> ListAsync(int skip, int take, CancellationToken ct);
    Task AddAsync(Project project, CancellationToken ct);
    Task UpdateAsync(Project project, CancellationToken ct);
    Task DeleteAsync(ProjectId id, CancellationToken ct);
}
