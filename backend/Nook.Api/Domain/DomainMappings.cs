namespace Nook.Api.Domain;

public static class DomainMappings
{
    public static PlanResponse ToResponse(this PlanEntity entity)
    {
        var options = DomainJson.ReadList<PlanOption>(entity.OptionsJson);
        var rsvps = DomainJson.ReadList<PlanRsvp>(entity.RsvpsJson);
        return new PlanResponse(
            entity.Id, entity.SpaceId, entity.Title, entity.Note, entity.Location,
            entity.CreatedBy, DomainJson.ReadList<string>(entity.InvitedMemberIdsJson),
            entity.Status, entity.StartAt, entity.DateDisplay, entity.EndAt, entity.CreatedAtUtc,
            options.Count == 0 ? null : options, rsvps.Count == 0 ? null : rsvps, entity.AllowMultiple);
    }

    public static PollResponse ToResponse(this PollEntity entity) =>
        new(entity.Id, entity.SpaceId, entity.PlanId, entity.Question, entity.Note,
            entity.CreatedBy, entity.AllowMultiple, entity.MembersCanAddOptions, entity.IsClosed,
            entity.CreatedAtUtc, DomainJson.ReadList<PollOption>(entity.OptionsJson));

    public static SharedListResponse ToResponse(this SharedListEntity entity) =>
        new(entity.Id, entity.SpaceId, entity.Name, entity.Description, entity.Template,
            entity.CreatedBy, entity.CreatedAtUtc, DomainJson.ReadList<SharedListItem>(entity.ItemsJson));

    public static TaskResponse ToResponse(this TaskEntity entity) =>
        new(entity.Id, entity.SpaceId, entity.Title, entity.Note, entity.CreatedBy, entity.AssignedTo,
            entity.DueAt, entity.Status, entity.CompletedBy, entity.CompletedAtUtc, entity.CreatedAtUtc);

    public static NoteResponse ToResponse(this NoteEntity entity) =>
        new(entity.Id, entity.SpaceId, entity.Title, entity.Content, entity.IsPinned,
            entity.CreatedBy, entity.CreatedAtUtc, entity.UpdatedAtUtc);

    public static ActivityResponse ToResponse(this ActivityEntity entity, SpaceEntity space) =>
        new(entity.Id, entity.SpaceId, space.Name, space.AccentColor, entity.ActorName,
            entity.ActorInitials, entity.Type, entity.EntityType, entity.EntityId,
            entity.TargetTitle, entity.ActionText, entity.CreatedAtUtc);
}
