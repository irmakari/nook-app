using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Nook.Api.Auth;
using Nook.Api.Domain;

namespace Nook.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<SpaceEntity> Spaces => Set<SpaceEntity>();
    public DbSet<PlanEntity> Plans => Set<PlanEntity>();
    public DbSet<PollEntity> Polls => Set<PollEntity>();
    public DbSet<SharedListEntity> SharedLists => Set<SharedListEntity>();
    public DbSet<TaskEntity> Tasks => Set<TaskEntity>();
    public DbSet<NoteEntity> Notes => Set<NoteEntity>();
    public DbSet<ActivityEntity> Activities => Set<ActivityEntity>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<SpaceEntity>().ToTable("Spaces");
        builder.Entity<PlanEntity>().ToTable("Plans");
        builder.Entity<PollEntity>().ToTable("Polls");
        builder.Entity<SharedListEntity>().ToTable("Lists");
        builder.Entity<TaskEntity>().ToTable("Tasks");
        builder.Entity<NoteEntity>().ToTable("Notes");
        builder.Entity<ActivityEntity>().ToTable("Activities");

        builder.Entity<SpaceEntity>().Property(x => x.SectionsJson).HasColumnType("jsonb");
        builder.Entity<SpaceEntity>().Property(x => x.SectionMetaJson).HasColumnType("jsonb");
        builder.Entity<SpaceEntity>().Property(x => x.MembersJson).HasColumnType("jsonb");
        builder.Entity<PlanEntity>().Property(x => x.InvitedMemberIdsJson).HasColumnType("jsonb");
        builder.Entity<PlanEntity>().Property(x => x.OptionsJson).HasColumnType("jsonb");
        builder.Entity<PlanEntity>().Property(x => x.RsvpsJson).HasColumnType("jsonb");
        builder.Entity<PollEntity>().Property(x => x.OptionsJson).HasColumnType("jsonb");
        builder.Entity<SharedListEntity>().Property(x => x.ItemsJson).HasColumnType("jsonb");

        builder.Entity<PlanEntity>().HasOne(x => x.Space).WithMany().HasForeignKey(x => x.SpaceId).OnDelete(DeleteBehavior.Cascade);
        builder.Entity<PollEntity>().HasOne(x => x.Space).WithMany().HasForeignKey(x => x.SpaceId).OnDelete(DeleteBehavior.Cascade);
        builder.Entity<SharedListEntity>().HasOne(x => x.Space).WithMany().HasForeignKey(x => x.SpaceId).OnDelete(DeleteBehavior.Cascade);
        builder.Entity<TaskEntity>().HasOne(x => x.Space).WithMany().HasForeignKey(x => x.SpaceId).OnDelete(DeleteBehavior.Cascade);
        builder.Entity<NoteEntity>().HasOne(x => x.Space).WithMany().HasForeignKey(x => x.SpaceId).OnDelete(DeleteBehavior.Cascade);
        builder.Entity<ActivityEntity>().HasOne(x => x.Space).WithMany().HasForeignKey(x => x.SpaceId).OnDelete(DeleteBehavior.Cascade);

        builder.Entity<PlanEntity>().HasIndex(x => x.SpaceId);
        builder.Entity<PollEntity>().HasIndex(x => new { x.SpaceId, x.PlanId });
        builder.Entity<SharedListEntity>().HasIndex(x => x.SpaceId);
        builder.Entity<TaskEntity>().HasIndex(x => new { x.SpaceId, x.Status });
        builder.Entity<NoteEntity>().HasIndex(x => new { x.SpaceId, x.IsPinned });
        builder.Entity<ActivityEntity>().HasIndex(x => new { x.SpaceId, x.CreatedAtUtc });
    }
}
