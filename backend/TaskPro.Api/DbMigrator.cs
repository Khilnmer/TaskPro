using Microsoft.EntityFrameworkCore;
using TaskPro.Infrastructure.Sql;

namespace TaskPro.Api.Infrastructure;

public static class DbMigrator
{
    public static async Task MigrateAsync(this WebApplication app)
    {
        await using var scope = app.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<TaskProDbContext>();
        await db.Database.MigrateAsync();
    }
}
