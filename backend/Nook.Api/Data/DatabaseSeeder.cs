using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Nook.Api.Domain;

namespace Nook.Api.Data;

public sealed class DatabaseSeeder(AppDbContext dbContext, IWebHostEnvironment environment, TimeProvider timeProvider)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task<SeedResult> SeedAsync(CancellationToken cancellationToken)
    {
        if (await dbContext.Spaces.AnyAsync(cancellationToken))
        {
            return new SeedResult(false, "Database already contains spaces.");
        }

        var path = Path.Combine(environment.ContentRootPath, "Data", "Seed", "seed-data.json");
        await using var stream = File.OpenRead(path);
        var data = await JsonSerializer.DeserializeAsync<SeedData>(stream, JsonOptions, cancellationToken)
            ?? throw new InvalidOperationException("Seed data could not be parsed.");

        var spaces = data.Spaces.Select(space => new SpaceEntity
        {
            Id = space.Id, Name = space.Name, Tagline = space.Tagline, Icon = space.Icon,
            AccentColor = space.AccentColor, Type = space.Type,
            SectionsJson = DomainJson.Write(space.Sections), SectionMetaJson = DomainJson.Write(space.SectionMeta),
            MembersJson = DomainJson.Write(space.Members), RecentActivity = space.RecentActivity,
            RecentActivityTime = space.RecentActivityTime, CreatedAtUtc = timeProvider.GetUtcNow()
        }).ToList();
        dbContext.Spaces.AddRange(spaces);

        dbContext.Plans.AddRange(data.Plans.Select(plan => new PlanEntity
        {
            Id = plan.Id, SpaceId = plan.SpaceId, Title = plan.Title, Note = plan.Note,
            Location = plan.Location, CreatedBy = plan.CreatedBy, Status = plan.Status,
            StartAt = plan.StartAt, EndAt = plan.EndAt, DateDisplay = plan.DateDisplay,
            AllowMultiple = plan.AllowMultiple, InvitedMemberIdsJson = DomainJson.Write(plan.InvitedMemberIds),
            OptionsJson = DomainJson.Write(plan.Options ?? []), RsvpsJson = DomainJson.Write(plan.Rsvps ?? []),
            CreatedAtUtc = plan.CreatedAt
        }));
        dbContext.Polls.AddRange(data.Polls.Select(poll => new PollEntity
        {
            Id = poll.Id, SpaceId = poll.SpaceId, PlanId = poll.PlanId, Question = poll.Question,
            Note = poll.Note, CreatedBy = poll.CreatedBy, AllowMultiple = poll.AllowMultiple,
            MembersCanAddOptions = poll.MembersCanAddOptions, IsClosed = poll.IsClosed,
            OptionsJson = DomainJson.Write(poll.Options), CreatedAtUtc = poll.CreatedAt
        }));
        dbContext.SharedLists.AddRange(data.Lists.Select(list => new SharedListEntity
        {
            Id = list.Id, SpaceId = list.SpaceId, Name = list.Name, Description = list.Description,
            Template = list.Template, CreatedBy = list.CreatedBy, CreatedAtUtc = list.CreatedAt,
            ItemsJson = DomainJson.Write(list.Items)
        }));
        dbContext.Tasks.AddRange(data.Tasks.Select(task => new TaskEntity
        {
            Id = task.Id, SpaceId = task.SpaceId, Title = task.Title, Note = task.Note,
            CreatedBy = task.CreatedBy, AssignedTo = task.AssignedTo, DueAt = task.DueAt,
            Status = task.Status, CompletedBy = task.CompletedBy, CompletedAtUtc = task.CompletedAt,
            CreatedAtUtc = task.CreatedAt
        }));
        dbContext.Notes.AddRange(data.Notes.Select(note => new NoteEntity
        {
            Id = note.Id, SpaceId = note.SpaceId, Title = note.Title, Content = note.Content,
            IsPinned = note.IsPinned, CreatedBy = note.CreatedBy, CreatedAtUtc = note.CreatedAt,
            UpdatedAtUtc = note.UpdatedAt
        }));

        var now = timeProvider.GetUtcNow();
        foreach (var space in data.Spaces)
        {
            foreach (var activity in space.RecentActivities)
            {
                dbContext.Activities.Add(new ActivityEntity
                {
                    Id = activity.Id,
                    SpaceId = space.Id,
                    ActorName = activity.User,
                    ActorInitials = Initials(activity.User),
                    Type = "member_joined",
                    ActionText = activity.Action,
                    TargetTitle = activity.Target,
                    CreatedAtUtc = now.Subtract(ParseAge(activity.TimeAgo))
                });
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return new SeedResult(true, $"Seeded {data.Spaces.Count} spaces and their related data.");
    }

    private static string Initials(string name) => string.Concat(name.Split(' ', StringSplitOptions.RemoveEmptyEntries).Take(2).Select(x => x[0])).ToUpperInvariant();

    private static TimeSpan ParseAge(string value)
    {
        if (value.EndsWith('m') && int.TryParse(value[..^1], out var minutes)) return TimeSpan.FromMinutes(minutes);
        if (value.EndsWith('h') && int.TryParse(value[..^1], out var hours)) return TimeSpan.FromHours(hours);
        if (value.EndsWith('d') && int.TryParse(value[..^1], out var days)) return TimeSpan.FromDays(days);
        return value.Equals("Yesterday", StringComparison.OrdinalIgnoreCase) ? TimeSpan.FromDays(1) : TimeSpan.Zero;
    }

    private sealed record SeedData(
        List<SeedSpace> Spaces,
        List<PlanResponse> Plans,
        List<PollResponse> Polls,
        List<SharedListResponse> Lists,
        List<TaskResponse> Tasks,
        List<NoteResponse> Notes);

    private sealed record SeedSpace(
        string Id, string Name, string? Tagline, string Icon, string AccentColor, string? Type,
        List<string> Sections, Dictionary<string, string> SectionMeta, List<SpaceMember> Members,
        List<SpaceActivity> RecentActivities, string? RecentActivity, string? RecentActivityTime);
}

public sealed record SeedResult(bool Seeded, string Message);
