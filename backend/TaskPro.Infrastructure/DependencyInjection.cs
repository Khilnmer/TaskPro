using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;
using TaskPro.Application.Abstractions;
using TaskPro.Infrastructure.Mongo;
using TaskPro.Infrastructure.Security;
using TaskPro.Infrastructure.Sql;
using TaskPro.Infrastructure.Sql.Repositories;

namespace TaskPro.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        try
        {
            BsonSerializer.RegisterSerializer(new GuidSerializer(GuidRepresentation.Standard));
        }
        catch
        {
            // ignore if already registered
        }

        services.AddDbContext<TaskProDbContext>(options =>
        {
            options.UseSqlServer(configuration.GetConnectionString("SqlServer"));
        });

        services.AddScoped<IUnitOfWork, EfUnitOfWork>();
        services.AddScoped<IUserRepository, EfUserRepository>();
        services.AddScoped<IUserCredentialsRepository, EfUserCredentialsRepository>();
        services.AddScoped<IProjectRepository, EfProjectRepository>();
        services.AddScoped<ITaskRepository, EfTaskRepository>();
        services.AddScoped<ITaskAssigneeRepository, EfTaskAssigneeRepository>();

        services.AddSingleton<IPasswordHasher, BcryptPasswordHasher>();
        services.AddSingleton<ITokenService, JwtTokenService>();

        services.Configure<MongoOptions>(configuration.GetSection(MongoOptions.SectionName));

        services.AddOptions<MongoOptions>()
            .Validate(o => !string.IsNullOrWhiteSpace(o.ConnectionString), "Mongo:ConnectionString is required")
            .ValidateOnStart();

        services.AddSingleton<IMongoClient>(sp =>
        {
            var o = sp.GetRequiredService<IOptions<MongoOptions>>().Value;
            return new MongoClient(o.ConnectionString);
        });

        services.AddSingleton<ITaskCommentStore, MongoTaskCommentStore>();

        return services;
    }
}
