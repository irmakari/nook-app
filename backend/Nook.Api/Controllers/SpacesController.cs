using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nook.Api.Data;
using Nook.Api.Domain;

namespace Nook.Api.Controllers;

[ApiController]
[Route("api/spaces")]
public sealed class SpacesController(
    AppDbContext dbContext,
    SpaceQueryService queryService,
    ActivityWriter activityWriter,
    TimeProvider timeProvider) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<SpaceResponse>> GetAll(CancellationToken cancellationToken) =>
        queryService.GetAllAsync(cancellationToken);

    [HttpGet("{id}")]
    public async Task<ActionResult<SpaceResponse>> Get(string id, CancellationToken cancellationToken)
    {
        var space = await queryService.GetAsync(id, cancellationToken);
        return space is null ? NotFound() : Ok(space);
    }

    [HttpPost]
    public async Task<ActionResult<SpaceResponse>> Create(CreateSpaceRequest request, CancellationToken cancellationToken)
    {
        if (request.Sections is not null && request.Sections.Any(string.IsNullOrWhiteSpace))
        {
            return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                ["sections"] = ["Sections cannot contain blank values."]
            }));
        }

        var currentUser = User.ToSpaceMember();
        var idBase = string.Concat(request.Name.Trim().ToLowerInvariant().Select(c => char.IsLetterOrDigit(c) ? c : '-')).Trim('-');
        var sections = request.Sections?.Select(section => section.Trim()).Distinct(StringComparer.OrdinalIgnoreCase).ToList() ?? [];
        var entity = new SpaceEntity
        {
            Id = $"{(string.IsNullOrWhiteSpace(idBase) ? "space" : idBase)}-{Guid.NewGuid():N}"[..Math.Min(40, (string.IsNullOrWhiteSpace(idBase) ? "space" : idBase).Length + 9)],
            Name = request.Name.Trim(),
            Tagline = string.IsNullOrWhiteSpace(request.Tagline) ? DefaultTagline(request.Type) : request.Tagline.Trim(),
            Icon = request.Icon,
            AccentColor = request.AccentColor,
            Type = request.Type,
            SectionsJson = DomainJson.Write(sections),
            SectionMetaJson = DomainJson.Write(sections.ToDictionary(x => x, _ => "0 items")),
            MembersJson = DomainJson.Write(new[] { currentUser with { Role = "owner" } }),
            RecentActivity = "Space created",
            RecentActivityTime = "Just now",
            CreatedAtUtc = timeProvider.GetUtcNow()
        };
        dbContext.Spaces.Add(entity);
        activityWriter.Add(entity, currentUser, "member_joined", "member", entity.Id, "created space", entity.Name);
        await dbContext.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, await queryService.GetAsync(entity.Id, cancellationToken));
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<SpaceResponse>> Update(string id, UpdateSpaceRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Spaces.FindAsync([id], cancellationToken);
        if (entity is null) return NotFound();
        if (request.Name is not null) entity.Name = request.Name.Trim();
        if (request.Tagline is not null) entity.Tagline = request.Tagline.Trim();
        if (request.Icon is not null) entity.Icon = request.Icon;
        if (request.AccentColor is not null) entity.AccentColor = request.AccentColor;
        if (request.Type is not null) entity.Type = request.Type;
        if (request.Sections is not null)
        {
            if (request.Sections.Any(string.IsNullOrWhiteSpace))
            {
                return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]>
                {
                    ["sections"] = ["Sections cannot contain blank values."]
                }));
            }

            entity.SectionsJson = DomainJson.Write(request.Sections.Select(section => section.Trim()).Distinct(StringComparer.OrdinalIgnoreCase).ToList());
        }
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(await queryService.GetAsync(id, cancellationToken));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Spaces.FindAsync([id], cancellationToken);
        if (entity is null) return NotFound();
        dbContext.Spaces.Remove(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpGet("{id}/members")]
    public async Task<ActionResult<IReadOnlyList<SpaceMember>>> GetMembers(string id, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Spaces.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null) return NotFound();
        var members = DomainJson.ReadList<SpaceMember>(entity.MembersJson);
        return Ok(members.Select((member, index) => member with { Role = index == 0 ? "owner" : member.Role ?? "member" }));
    }

    [HttpPost("{id}/members")]
    public async Task<ActionResult<SpaceResponse>> AddMember(string id, AddSpaceMemberRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Spaces.FindAsync([id], cancellationToken);
        if (entity is null) return NotFound();
        var members = DomainJson.ReadList<SpaceMember>(entity.MembersJson);
        if (members.All(x => !string.Equals(x.Name, request.Name, StringComparison.OrdinalIgnoreCase)))
        {
            var member = new SpaceMember(request.Id, request.Name.Trim(), request.Initials.Trim(), "member", timeProvider.GetUtcNow().ToString("O"));
            members.Add(member);
            entity.MembersJson = DomainJson.Write(members);
            activityWriter.Add(entity, member, "member_joined", "member", entity.Id, "joined", entity.Name);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        return Ok(await queryService.GetAsync(id, cancellationToken));
    }

    [HttpDelete("{id}/members/{memberName}")]
    public async Task<ActionResult<SpaceResponse>> RemoveMember(string id, string memberName, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Spaces.FindAsync([id], cancellationToken);
        if (entity is null) return NotFound();
        var members = DomainJson.ReadList<SpaceMember>(entity.MembersJson);
        members.RemoveAll(x => string.Equals(x.Name, memberName, StringComparison.OrdinalIgnoreCase));
        entity.MembersJson = DomainJson.Write(members);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(await queryService.GetAsync(id, cancellationToken));
    }

    private static string DefaultTagline(string type) => type switch
    {
        "friends" => "Plans, lists & chaos",
        "home" => "Family or roommates",
        "partner" => "For you two",
        "trip" => "Plan something together",
        _ => "A private space for our group"
    };
}
