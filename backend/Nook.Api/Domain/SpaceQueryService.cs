using Microsoft.EntityFrameworkCore;
using Nook.Api.Data;

namespace Nook.Api.Domain;

public sealed class SpaceQueryService(AppDbContext dbContext)
{
    public async Task<IReadOnlyList<SpaceResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        var spaces = await dbContext.Spaces.AsNoTracking().OrderByDescending(x => x.CreatedAtUtc).ToListAsync(cancellationToken);
        var responses = new List<SpaceResponse>(spaces.Count);
        foreach (var space in spaces)
        {
            responses.Add(await BuildAsync(space, cancellationToken));
        }
        return responses;
    }

    public async Task<SpaceResponse?> GetAsync(string id, CancellationToken cancellationToken)
    {
        var space = await dbContext.Spaces.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        return space is null ? null : await BuildAsync(space, cancellationToken);
    }

    private async Task<SpaceResponse> BuildAsync(SpaceEntity space, CancellationToken cancellationToken)
    {
        var plans = await dbContext.Plans.AsNoTracking().Where(x => x.SpaceId == space.Id).OrderByDescending(x => x.CreatedAtUtc).ToListAsync(cancellationToken);
        var activePlan = plans.FirstOrDefault();
        var activePollCount = await dbContext.Polls.CountAsync(x => x.SpaceId == space.Id && !x.IsClosed, cancellationToken);
        var lists = await dbContext.SharedLists.AsNoTracking().Where(x => x.SpaceId == space.Id).ToListAsync(cancellationToken);
        var openTaskCount = await dbContext.Tasks.CountAsync(x => x.SpaceId == space.Id && x.Status == "open", cancellationToken);
        var noteCount = await dbContext.Notes.CountAsync(x => x.SpaceId == space.Id, cancellationToken);
        var activities = await dbContext.Activities.AsNoTracking().Where(x => x.SpaceId == space.Id).OrderByDescending(x => x.CreatedAtUtc).Take(5).ToListAsync(cancellationToken);

        var sections = DomainJson.ReadList<string>(space.SectionsJson);
        var sectionMeta = DomainJson.ReadDictionary(space.SectionMetaJson);
        if (sections.Contains("Plans")) sectionMeta["Plans"] = $"{plans.Count} upcoming";
        if (sections.Contains("Polls")) sectionMeta["Polls"] = $"{activePollCount} active";
        var itemCount = lists.Sum(x => DomainJson.ReadList<SharedListItem>(x.ItemsJson).Count);
        if (sections.Contains("Shared Lists")) sectionMeta["Shared Lists"] = $"{lists.Count} {(lists.Count == 1 ? "list" : "lists")} · {itemCount} items";
        if (sections.Contains("Shopping"))
        {
            var shopping = lists.Where(x => x.Template == "shopping").ToList();
            sectionMeta["Shopping"] = $"{shopping.Count} list · {shopping.Sum(x => DomainJson.ReadList<SharedListItem>(x.ItemsJson).Count)} items";
        }
        if (sections.Contains("To-do")) sectionMeta["To-do"] = $"{openTaskCount} remaining";
        if (sections.Contains("Notes")) sectionMeta["Notes"] = $"{noteCount} {(noteCount == 1 ? "note" : "notes")}";

        var members = DomainJson.ReadList<SpaceMember>(space.MembersJson);
        var upcoming = BuildUpcoming(activePlan);
        var recent = activities.Select(x => new SpaceActivity(x.Id, x.ActorName, x.ActionText, x.TargetTitle, ToTimeAgo(x.CreatedAtUtc))).ToList();
        return new SpaceResponse(space.Id, space.Name, space.Tagline, space.Icon, space.AccentColor,
            space.Type, sections, sectionMeta, members.Count, members, upcoming, recent,
            space.RecentActivity, space.RecentActivityTime);
    }

    private static UpcomingPlan? BuildUpcoming(PlanEntity? plan)
    {
        if (plan is null) return null;
        if (plan.Status == "voting")
        {
            var options = DomainJson.ReadList<PlanOption>(plan.OptionsJson);
            return new UpcomingPlan(plan.Id, plan.Title, "Choosing a time", null, plan.Location,
                options.Sum(x => x.Voters.Count), null, null, "voting");
        }

        var rsvps = DomainJson.ReadList<PlanRsvp>(plan.RsvpsJson);
        var going = rsvps.Where(x => x.Status == "going").ToList();
        return new UpcomingPlan(plan.Id, plan.Title, plan.DateDisplay ?? plan.StartAt ?? "Upcoming",
            null, plan.Location, going.Count, rsvps.Count(x => x.Status == "maybe"),
            going.Select(x => new SpaceMember(x.UserId, x.UserName, x.Initials)).ToList(), "confirmed");
    }

    private static string ToTimeAgo(DateTimeOffset createdAt)
    {
        var elapsed = DateTimeOffset.UtcNow - createdAt;
        if (elapsed.TotalMinutes < 1) return "Just now";
        if (elapsed.TotalHours < 1) return $"{(int)elapsed.TotalMinutes}m";
        if (elapsed.TotalDays < 1) return $"{(int)elapsed.TotalHours}h";
        return $"{(int)elapsed.TotalDays}d";
    }
}
