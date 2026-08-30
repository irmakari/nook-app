using System.ComponentModel.DataAnnotations;

namespace Nook.Api.Domain;

public sealed class SpaceEntity
{
    [MaxLength(100)] public required string Id { get; set; }
    [MaxLength(120)] public required string Name { get; set; }
    [MaxLength(240)] public string? Tagline { get; set; }
    [MaxLength(40)] public required string Icon { get; set; }
    [MaxLength(16)] public required string AccentColor { get; set; }
    [MaxLength(24)] public string? Type { get; set; }
    public required string SectionsJson { get; set; }
    public required string SectionMetaJson { get; set; }
    public required string MembersJson { get; set; }
    [MaxLength(300)] public string? RecentActivity { get; set; }
    [MaxLength(80)] public string? RecentActivityTime { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
}

public sealed class PlanEntity
{
    [MaxLength(100)] public required string Id { get; set; }
    [MaxLength(100)] public required string SpaceId { get; set; }
    [MaxLength(200)] public required string Title { get; set; }
    [MaxLength(2000)] public string? Note { get; set; }
    [MaxLength(300)] public string? Location { get; set; }
    [MaxLength(120)] public required string CreatedBy { get; set; }
    [MaxLength(24)] public required string Status { get; set; }
    [MaxLength(80)] public string? StartAt { get; set; }
    [MaxLength(80)] public string? EndAt { get; set; }
    [MaxLength(120)] public string? DateDisplay { get; set; }
    public bool? AllowMultiple { get; set; }
    public required string InvitedMemberIdsJson { get; set; }
    public required string OptionsJson { get; set; }
    public required string RsvpsJson { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public SpaceEntity Space { get; set; } = null!;
}

public sealed class PollEntity
{
    [MaxLength(100)] public required string Id { get; set; }
    [MaxLength(100)] public required string SpaceId { get; set; }
    [MaxLength(100)] public string? PlanId { get; set; }
    [MaxLength(300)] public required string Question { get; set; }
    [MaxLength(2000)] public string? Note { get; set; }
    [MaxLength(120)] public required string CreatedBy { get; set; }
    public bool AllowMultiple { get; set; }
    public bool MembersCanAddOptions { get; set; }
    public bool IsClosed { get; set; }
    public required string OptionsJson { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public SpaceEntity Space { get; set; } = null!;
}

public sealed class SharedListEntity
{
    [MaxLength(100)] public required string Id { get; set; }
    [MaxLength(100)] public required string SpaceId { get; set; }
    [MaxLength(200)] public required string Name { get; set; }
    [MaxLength(1000)] public string? Description { get; set; }
    [MaxLength(40)] public required string Template { get; set; }
    [MaxLength(120)] public required string CreatedBy { get; set; }
    public required string ItemsJson { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public SpaceEntity Space { get; set; } = null!;
}

public sealed class TaskEntity
{
    [MaxLength(100)] public required string Id { get; set; }
    [MaxLength(100)] public required string SpaceId { get; set; }
    [MaxLength(240)] public required string Title { get; set; }
    [MaxLength(2000)] public string? Note { get; set; }
    [MaxLength(120)] public required string CreatedBy { get; set; }
    [MaxLength(120)] public string? AssignedTo { get; set; }
    [MaxLength(120)] public string? DueAt { get; set; }
    [MaxLength(20)] public required string Status { get; set; }
    [MaxLength(120)] public string? CompletedBy { get; set; }
    public DateTimeOffset? CompletedAtUtc { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public SpaceEntity Space { get; set; } = null!;
}

public sealed class NoteEntity
{
    [MaxLength(100)] public required string Id { get; set; }
    [MaxLength(100)] public required string SpaceId { get; set; }
    [MaxLength(240)] public string? Title { get; set; }
    public required string Content { get; set; }
    public bool IsPinned { get; set; }
    [MaxLength(120)] public required string CreatedBy { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset UpdatedAtUtc { get; set; }
    public SpaceEntity Space { get; set; } = null!;
}

public sealed class ActivityEntity
{
    [MaxLength(100)] public required string Id { get; set; }
    [MaxLength(100)] public required string SpaceId { get; set; }
    [MaxLength(120)] public required string ActorName { get; set; }
    [MaxLength(12)] public required string ActorInitials { get; set; }
    [MaxLength(40)] public required string Type { get; set; }
    [MaxLength(24)] public string? EntityType { get; set; }
    [MaxLength(100)] public string? EntityId { get; set; }
    [MaxLength(300)] public string? TargetTitle { get; set; }
    [MaxLength(200)] public required string ActionText { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public SpaceEntity Space { get; set; } = null!;
}
