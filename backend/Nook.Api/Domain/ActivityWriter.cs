using Nook.Api.Data;

namespace Nook.Api.Domain;

public sealed class ActivityWriter(AppDbContext dbContext, TimeProvider timeProvider)
{
    public void Add(
        SpaceEntity space,
        SpaceMember actor,
        string type,
        string? entityType,
        string? entityId,
        string actionText,
        string? targetTitle)
    {
        dbContext.Activities.Add(new ActivityEntity
        {
            Id = $"act-{Guid.NewGuid():N}",
            SpaceId = space.Id,
            ActorName = actor.Name,
            ActorInitials = actor.Initials,
            Type = type,
            EntityType = entityType,
            EntityId = entityId,
            ActionText = actionText,
            TargetTitle = targetTitle,
            CreatedAtUtc = timeProvider.GetUtcNow()
        });
        space.RecentActivity = targetTitle is null ? $"{actor.Name} {actionText}" : $"{actor.Name} {actionText} {targetTitle}";
        space.RecentActivityTime = "Just now";
    }
}
