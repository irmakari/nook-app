using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nook.Api.Data;
using Nook.Api.Domain;

namespace Nook.Api.Controllers;

[ApiController]
[Route("api/plans")]
public sealed class PlansController(AppDbContext dbContext, ActivityWriter activityWriter, TimeProvider timeProvider) : ControllerBase
{
    [HttpGet]
    public async Task<IReadOnlyList<PlanResponse>> GetAll([FromQuery] string? spaceId, CancellationToken cancellationToken)
    {
        var query = dbContext.Plans.AsNoTracking();
        if (spaceId is not null) query = query.Where(x => x.SpaceId == spaceId);
        return (await query.OrderByDescending(x => x.CreatedAtUtc).ToListAsync(cancellationToken)).Select(x => x.ToResponse()).ToList();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PlanResponse>> Get(string id, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Plans.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        return entity is null ? NotFound() : Ok(entity.ToResponse());
    }

    [HttpPost]
    public async Task<ActionResult<PlanResponse>> Create(CreatePlanRequest request, CancellationToken cancellationToken)
    {
        var space = await dbContext.Spaces.FindAsync([request.SpaceId], cancellationToken);
        if (space is null) return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]> { ["spaceId"] = ["Space was not found."] }));
        var validationProblem = ValidateCreate(request);
        if (validationProblem is not null) return validationProblem;

        var currentUser = User.ToSpaceMember();
        var id = $"plan-{Guid.NewGuid():N}";
        var now = timeProvider.GetUtcNow();
        var voting = request.Mode == "vote";
        var options = voting
            ? request.VotingOptions!.Select((option, index) => new PlanOption(
                $"opt-{id}-{index + 1}", id, option.Date, option.Time,
                option.Time is null ? option.Date : $"{option.Date} · {option.Time}",
                [currentUser.Name], [currentUser])).ToList()
            : [];
        var rsvps = voting ? [] : new List<PlanRsvp>
        {
            new($"rsvp-{Guid.NewGuid():N}", id, currentUser.Name,
                currentUser.Name, currentUser.Initials, "going")
        };
        var dateDisplay = voting ? "Choosing a time" : $"{request.SingleDate ?? "This weekend"}{(request.SingleTime is null ? "" : $" · {request.SingleTime}")}";
        var entity = new PlanEntity
        {
            Id = id, SpaceId = request.SpaceId, Title = request.Title.Trim(), Note = request.Note?.Trim(),
            Location = request.Location?.Trim(), CreatedBy = currentUser.Name,
            InvitedMemberIdsJson = DomainJson.Write((request.InvitedMembers ?? []).Select(x => x.Name).ToList()),
            Status = voting ? "voting" : "confirmed",
            StartAt = request.SingleDate is null ? null : $"{request.SingleDate}T{request.SingleTime ?? "12:00"}:00Z",
            EndAt = request.EndTime, DateDisplay = dateDisplay, CreatedAtUtc = now,
            OptionsJson = DomainJson.Write(options), RsvpsJson = DomainJson.Write(rsvps), AllowMultiple = request.AllowMultiple
        };
        dbContext.Plans.Add(entity);
        activityWriter.Add(space, currentUser, "plan_created", "plan", id, "created a plan", entity.Title);
        await dbContext.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(Get), new { id }, entity.ToResponse());
    }

    [HttpPost("{id}/options/{optionId}/vote")]
    public async Task<ActionResult<PlanResponse>> Vote(string id, string optionId, VoteRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Plans.FindAsync([id], cancellationToken);
        if (entity is null) return NotFound();
        if (entity.Status != "voting") return Conflict("Only voting plans can accept option votes.");
        var options = DomainJson.ReadList<PlanOption>(entity.OptionsJson);
        if (options.All(x => x.Id != optionId)) return NotFound();
        var alreadyTarget = options.Single(x => x.Id == optionId).VoterIds.Contains(request.User.Name);
        options = options.Select(option =>
        {
            var ids = option.VoterIds.ToList();
            var voters = option.Voters.ToList();
            if (option.Id == optionId)
            {
                if (alreadyTarget) { ids.Remove(request.User.Name); voters.RemoveAll(x => x.Name == request.User.Name); }
                else { ids.Add(request.User.Name); voters.Add(request.User); }
            }
            else if (entity.AllowMultiple == false && !alreadyTarget)
            {
                ids.Remove(request.User.Name); voters.RemoveAll(x => x.Name == request.User.Name);
            }
            return option with { VoterIds = ids, Voters = voters };
        }).ToList();
        entity.OptionsJson = DomainJson.Write(options);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(entity.ToResponse());
    }

    [HttpPost("{id}/finalize")]
    public async Task<ActionResult<PlanResponse>> Finalize(string id, FinalizePlanRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Plans.FindAsync([id], cancellationToken);
        if (entity is null) return NotFound();
        if (entity.Status != "voting") return Conflict("Only voting plans can be finalized.");
        var option = DomainJson.ReadList<PlanOption>(entity.OptionsJson).SingleOrDefault(x => x.Id == request.OptionId);
        if (option is null) return NotFound();
        entity.Status = "confirmed";
        entity.DateDisplay = option.Title;
        entity.StartAt = $"{option.Date}T{option.Time ?? "12:00"}:00Z";
        entity.RsvpsJson = DomainJson.Write(option.Voters.Select(x => new PlanRsvp(
            $"rsvp-{Guid.NewGuid():N}", id, x.Name, x.Name, x.Initials, "going")).ToList());
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(entity.ToResponse());
    }

    [HttpPost("{id}/rsvp")]
    public async Task<ActionResult<PlanResponse>> Rsvp(string id, RsvpPlanRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Plans.FindAsync([id], cancellationToken);
        if (entity is null) return NotFound();
        if (request.Status is not ("going" or "maybe" or "declined"))
        {
            return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                ["status"] = ["Status must be going, maybe, or declined."]
            }));
        }

        var rsvps = DomainJson.ReadList<PlanRsvp>(entity.RsvpsJson);
        var existing = rsvps.FindIndex(x => x.UserId == request.User.Name);
        var next = new PlanRsvp(existing >= 0 ? rsvps[existing].Id : $"rsvp-{Guid.NewGuid():N}", id,
            request.User.Name, request.User.Name, request.User.Initials, request.Status);
        if (existing >= 0) rsvps[existing] = next; else rsvps.Add(next);
        entity.RsvpsJson = DomainJson.Write(rsvps);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(entity.ToResponse());
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Plans.FindAsync([id], cancellationToken);
        if (entity is null) return NotFound();
        dbContext.Plans.Remove(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private ActionResult? ValidateCreate(CreatePlanRequest request)
    {
        var errors = new Dictionary<string, string[]>();
        if (request.Mode is not ("know" or "vote"))
        {
            errors["mode"] = ["Mode must be know or vote."];
        }

        if (request.Mode == "vote")
        {
            var options = request.VotingOptions ?? [];
            if (options.Count < 2)
            {
                errors["votingOptions"] = ["Voting plans require at least two options."];
            }
            else if (options.Any(option => string.IsNullOrWhiteSpace(option.Date)))
            {
                errors["votingOptions"] = ["Voting option dates cannot be blank."];
            }
        }

        if (request.Mode == "know" && string.IsNullOrWhiteSpace(request.SingleDate))
        {
            errors["singleDate"] = ["Confirmed plans require a date."];
        }

        return errors.Count == 0 ? null : ValidationProblem(new ValidationProblemDetails(errors));
    }
}
