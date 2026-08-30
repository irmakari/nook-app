using System.ComponentModel.DataAnnotations;

namespace Nook.Api.Domain;

public sealed record SpaceMember(
    string? Id,
    string Name,
    string Initials,
    string? Role = null,
    string? JoinedAt = null);

public sealed record UpcomingPlan(
    string Id,
    string Title,
    string Date,
    string? Time,
    string? Location,
    int GoingCount,
    int? MaybeCount,
    IReadOnlyList<SpaceMember>? Attendees,
    string? Status);

public sealed record SpaceActivity(string Id, string User, string Action, string? Target, string TimeAgo);

public sealed record SpaceResponse(
    string Id,
    string Name,
    string? Tagline,
    string Icon,
    string AccentColor,
    string? Type,
    IReadOnlyList<string> Sections,
    IReadOnlyDictionary<string, string> SectionMeta,
    int MemberCount,
    IReadOnlyList<SpaceMember> Members,
    UpcomingPlan? UpcomingPlan,
    IReadOnlyList<SpaceActivity> RecentActivities,
    string? RecentActivity,
    string? RecentActivityTime);

public sealed record CreateSpaceRequest(
    [param: Required, MaxLength(120)] string Name,
    [param: Required, MaxLength(40)] string Icon,
    [param: Required, MaxLength(16)] string AccentColor,
    [param: Required, MaxLength(24)] string Type,
    IReadOnlyList<string>? Sections,
    [param: MaxLength(240)] string? Tagline);

public sealed record UpdateSpaceRequest(
    [param: MaxLength(120)] string? Name,
    [param: MaxLength(240)] string? Tagline,
    [param: MaxLength(40)] string? Icon,
    [param: MaxLength(16)] string? AccentColor,
    [param: MaxLength(24)] string? Type,
    IReadOnlyList<string>? Sections);

public sealed record AddSpaceMemberRequest(
    string? Id,
    [param: Required, MaxLength(120)] string Name,
    [param: Required, MaxLength(12)] string Initials);

public sealed record PlanRsvp(string Id, string PlanId, string UserId, string UserName, string Initials, string Status);
public sealed record PlanOption(string Id, string PlanId, string Date, string? Time, string Title, IReadOnlyList<string> VoterIds, IReadOnlyList<SpaceMember> Voters);
public sealed record PlanResponse(string Id, string SpaceId, string Title, string? Note, string? Location, string CreatedBy, IReadOnlyList<string> InvitedMemberIds, string Status, string? StartAt, string? DateDisplay, string? EndAt, DateTimeOffset CreatedAt, IReadOnlyList<PlanOption>? Options, IReadOnlyList<PlanRsvp>? Rsvps, bool? AllowMultiple);
public sealed record VotingOptionRequest([param: Required] string Date, string? Time);
public sealed record CreatePlanRequest([param: Required] string SpaceId, [param: Required, MaxLength(200)] string Title, string? Note, string? Location, [param: Required] string Mode, string? SingleDate, string? SingleTime, string? EndTime, IReadOnlyList<VotingOptionRequest>? VotingOptions, IReadOnlyList<SpaceMember>? InvitedMembers, bool? AllowMultiple);
public sealed record VoteRequest([param: Required] SpaceMember User);
public sealed record FinalizePlanRequest([param: Required] string OptionId);
public sealed record RsvpPlanRequest([param: Required] SpaceMember User, [param: Required] string Status);

public sealed record PollOption(string Id, string PollId, string Text, string CreatedBy, DateTimeOffset CreatedAt, IReadOnlyList<string> VoterIds, IReadOnlyList<SpaceMember> Voters);
public sealed record PollResponse(string Id, string SpaceId, string? PlanId, string Question, string? Note, string CreatedBy, bool AllowMultiple, bool MembersCanAddOptions, bool IsClosed, DateTimeOffset CreatedAt, IReadOnlyList<PollOption> Options);
public sealed record CreatePollRequest([param: Required] string SpaceId, [param: Required, MaxLength(300)] string Question, string? Note, [param: MinLength(2)] IReadOnlyList<string> Options, bool AllowMultiple, bool MembersCanAddOptions, string? PlanId = null);
public sealed record AddPollOptionRequest([param: Required] string Text, [param: Required] SpaceMember User);

public sealed record SharedListItem(string Id, string ListId, string Text, string? Note, string CreatedBy, bool Completed, string? CompletedBy, DateTimeOffset? CompletedAt, DateTimeOffset CreatedAt);
public sealed record SharedListResponse(string Id, string SpaceId, string Name, string? Description, string Template, string CreatedBy, DateTimeOffset CreatedAt, IReadOnlyList<SharedListItem> Items);
public sealed record CreateListRequest([param: Required] string SpaceId, [param: Required, MaxLength(200)] string Name, string? Description, [param: Required] string Template);
public sealed record AddListItemRequest([param: Required] string Text, string? Note, [param: Required] SpaceMember User);

public sealed record TaskResponse(string Id, string SpaceId, string Title, string? Note, string CreatedBy, string? AssignedTo, string? DueAt, string Status, string? CompletedBy, DateTimeOffset? CompletedAt, DateTimeOffset CreatedAt);
public sealed record CreateTaskRequest([param: Required] string SpaceId, [param: Required, MaxLength(240)] string Title, string? Note, string? AssignedTo, string? DueAt);
public sealed record UpdateTaskRequest(string? Title, string? Note, string? AssignedTo, string? DueAt, string? Status);

public sealed record NoteResponse(string Id, string SpaceId, string? Title, string Content, bool IsPinned, string CreatedBy, DateTimeOffset CreatedAt, DateTimeOffset UpdatedAt);
public sealed record CreateNoteRequest([param: Required] string SpaceId, string? Title, [param: Required] string Content, bool IsPinned);
public sealed record UpdateNoteRequest(string? Title, string? Content, bool? IsPinned);

public sealed record ActivityResponse(string Id, string SpaceId, string SpaceName, string SpaceAccentColor, string ActorName, string ActorInitials, string Type, string? EntityType, string? EntityId, string? TargetTitle, string ActionText, DateTimeOffset CreatedAt);
