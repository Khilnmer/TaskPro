using Microsoft.EntityFrameworkCore;
using TaskPro.Domain.Projects;
using TaskPro.Domain.Tasks;
using TaskPro.Domain.Users;

namespace TaskPro.Infrastructure.Sql;

public sealed class TaskProDbContext : DbContext
{
    public TaskProDbContext(DbContextOptions<TaskProDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<UserCredentials> UserCredentials => Set<UserCredentials>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectTask> Tasks => Set<ProjectTask>();
    public DbSet<TaskAssignee> TaskAssignees => Set<TaskAssignee>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(b =>
        {
            b.ToTable("Users");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id)
                .HasConversion(v => v.Value, v => new UserId(v))
                .ValueGeneratedNever();
            b.Property(x => x.Email).HasMaxLength(320).IsRequired();
            b.HasIndex(x => x.Email).IsUnique();
            b.Property(x => x.DisplayName).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<UserCredentials>(b =>
        {
            b.ToTable("UserCredentials");
            b.HasKey(x => x.UserId);

            b.Property(x => x.UserId)
                .HasConversion(v => v.Value, v => new UserId(v))
                .ValueGeneratedNever();

            b.Property(x => x.PasswordHash)
                .HasMaxLength(400)
                .IsRequired();

            b.HasOne<User>()
                .WithOne()
                .HasForeignKey<UserCredentials>(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Project>(b =>
        {
            b.ToTable("Projects");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id)
                .HasConversion(v => v.Value, v => new ProjectId(v))
                .ValueGeneratedNever();

            b.Property(x => x.OwnerUserId)
                .HasConversion(v => v.Value, v => new UserId(v));

            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
            b.Property(x => x.Description).HasMaxLength(2000);
        });

        modelBuilder.Entity<ProjectTask>(b =>
        {
            b.ToTable("Tasks");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id)
                .HasConversion(v => v.Value, v => new TaskId(v))
                .ValueGeneratedNever();

            b.Property(x => x.ProjectId)
                .HasConversion(v => v.Value, v => new ProjectId(v));

            b.Property(x => x.Title).HasMaxLength(300).IsRequired();
            b.Property(x => x.Description).HasMaxLength(4000);
            b.Property(x => x.Priority).IsRequired();
            b.Property(x => x.Status).IsRequired();
            b.Property(x => x.CreatedAt).IsRequired();
        });

        modelBuilder.Entity<TaskAssignee>(b =>
        {
            b.ToTable("TaskAssignees");
            b.HasKey(x => x.Id);

            b.Property(x => x.TaskId)
                .HasConversion(v => v.Value, v => new TaskId(v));

            b.Property(x => x.UserId)
                .HasConversion(v => v.Value, v => new UserId(v));

            b.HasIndex(x => new { x.TaskId, x.UserId }).IsUnique();
        });

        base.OnModelCreating(modelBuilder);
    }
}
