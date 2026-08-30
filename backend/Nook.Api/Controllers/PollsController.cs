using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nook.Api.Data;
using Nook.Api.Domain;

namespace Nook.Api.Controllers;

[ApiController]
[Route("api/polls")]
public sealed class PollsController(AppDbContext dbContext, ActivityWriter activityWriter, TimeProvider timeProvider) : ControllerBase
{
    [HttpGet]
    public async Task<IReadOnlyList<PollResponse>> GetAll([FromQuery] string? spaceId, [FromQuery] string? planId, CancellationToken cancellationToken)
    {
        var query = dbContext.Polls.AsNoTracking();
        if (spaceId is not null) query = query.Where(x => x.SpaceId == spaceId);
        if (planId is not null) query = query.Where(x => x.PlanId == planId);
        return (await query.OrderByDescending(x => x.CreatedAtUtc).ToListAsync(cancellationToken)).Select(x => x.ToResponse()).ToList();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PollResponse>> Get(string id, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Polls.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        return entity is null ? NotFound() : Ok(entity.ToResponse());
    }

    [HttpPost]
    public async Task<ActionResult<PollResponse>> Create(CreatePollRequest request, CancellationToken cancellationToken)
    {
        var space = await dbContext.Spaces.FindAsync([request.SpaceId], cancellationToken);
        if (space is null) return BadRequest();
        var optionTexts = (request.Options ?? [])
            .Select(text => text.Trim())
            .Where(text => !string.IsNullOrWhiteSpace(text))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
        if (optionTexts.Count < 2)
        {
            return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                ["options"] = ["Polls require at least two non-blank options."]
            }));
        }

        var currentUser = User.ToSpaceMember();
        var id = $"poll-{Guid.NewGuid():N}";
        var now = timeProvider.GetUtcNow();
        var options = optionTexts.Select((text, index) => new PollOption(
            $"popt-{Guid.NewGuid():N}", id, text, currentUser.Name, now,
            index == 0 ? [currentUser.Name] : [],
            index == 0 ? [currentUser] : [])).ToList();
        var entity = new PollEntity
        {
            Id = id, SpaceId = request.SpaceId, PlanId = request.PlanId,
            Question = request.Question.Trim(), Note = request.Note?.Trim(),
            CreatedBy = currentUser.Name, AllowMultiple = request.AllowMultiple,
            MembersCanAddOptions = request.MembersCanAddOptions, IsClosed = false,
            OptionsJson = DomainJson.Write(options), CreatedAtUtc = now
        };
        dbContext.Polls.Add(entity);
        activityWriter.Add(space, currentUser, "poll_created", "poll", id, "started a poll", entity.Question);
        await dbContext.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(Get), new { id }, entity.ToResponse());
    }

    [HttpPost("{id}/options/{optionId}/vote")]
    public async Task<ActionResult<PollResponse>> Vote(string id, string optionId, VoteRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Polls.FindAsync([id], cancellationToken);
        if (entity is null || entity.IsClosed) return NotFound();
        var options = DomainJson.ReadList<PollOption>(entity.OptionsJson);
        var target = options.SingleOrDefault(x => x.Id == optionId);
        if (target is null) return NotFound();
        var alreadyTarget = target.VoterIds.Contains(request.User.Name);
        options = options.Select(option =>
        {
            var ids = option.VoterIds.ToList();
            var voters = option.Voters.ToList();
            if (option.Id == optionId)
            {
                if (alreadyTarget) { ids.Remove(request.User.Name); voters.RemoveAll(x => x.Name == request.User.Name); }
                else { ids.Add(request.User.Name); voters.Add(request.User); }
            }
            else if (!entity.AllowMultiple)
            {
                ids.Remove(request.User.Name); voters.RemoveAll(x => x.Name == request.User.Name);
            }
            return option with { VoterIds = ids, Voters = voters };
        }).ToList();
        entity.OptionsJson = DomainJson.Write(options);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(entity.ToResponse());
    }

    [HttpPost("{id}/options")]
    public async Task<ActionResult<PollResponse>> AddOption(string id, AddPollOptionRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Polls.FindAsync([id], cancellationToken);
        if (entity is null || entity.IsClosed) return NotFound();
        if (!entity.MembersCanAddOptions) return Forbid();
        if (string.IsNullOrWhiteSpace(request.Text))
        {
            return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                ["text"] = ["Option text cannot be blank."]
            }));
        }

        var options = DomainJson.ReadList<PollOption>(entity.OptionsJson);
        var optionText = request.Text.Trim();
        if (options.Any(option => string.Equals(option.Text, optionText, StringComparison.OrdinalIgnoreCase)))
        {
            return Conflict("Poll option already exists.");
        }

        options.Add(new PollOption($"popt-{Guid.NewGuid():N}", id, optionText, request.User.Name,
            timeProvider.GetUtcNow(), [request.User.Name], [request.User]));
        entity.OptionsJson = DomainJson.Write(options);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(entity.ToResponse());
    }

    [HttpPost("{id}/close")]
    public async Task<ActionResult<PollResponse>> Close(string id, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Polls.FindAsync([id], cancellationToken);
        if (entity is null) return NotFound();
        entity.IsClosed = true;
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(entity.ToResponse());
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Polls.FindAsync([id], cancellationToken);
        if (entity is null) return NotFound();
        dbContext.Polls.Remove(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
