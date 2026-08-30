using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nook.Api.Data;
using Nook.Api.Domain;

namespace Nook.Api.Controllers;

[ApiController]
[Route("api/notes")]
public sealed class NotesController(AppDbContext dbContext, ActivityWriter activityWriter, TimeProvider timeProvider) : ControllerBase
{
    [HttpGet]
    public async Task<IReadOnlyList<NoteResponse>> GetAll([FromQuery] string? spaceId, CancellationToken cancellationToken)
    {
        var query = dbContext.Notes.AsNoTracking();
        if (spaceId is not null) query = query.Where(x => x.SpaceId == spaceId);
        return (await query.OrderByDescending(x => x.IsPinned).ThenByDescending(x => x.UpdatedAtUtc).ToListAsync(cancellationToken)).Select(x => x.ToResponse()).ToList();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<NoteResponse>> Get(string id, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Notes.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        return entity is null ? NotFound() : Ok(entity.ToResponse());
    }

    [HttpPost]
    public async Task<ActionResult<NoteResponse>> Create(CreateNoteRequest request, CancellationToken cancellationToken)
    {
        var space = await dbContext.Spaces.FindAsync([request.SpaceId], cancellationToken);
        if (space is null) return BadRequest();
        var currentUser = User.ToSpaceMember();
        var now = timeProvider.GetUtcNow();
        var entity = new NoteEntity
        {
            Id = $"note-{Guid.NewGuid():N}", SpaceId = request.SpaceId,
            Title = string.IsNullOrWhiteSpace(request.Title) ? null : request.Title.Trim(),
            Content = request.Content.Trim(), IsPinned = request.IsPinned,
            CreatedBy = currentUser.Name, CreatedAtUtc = now, UpdatedAtUtc = now
        };
        dbContext.Notes.Add(entity);
        activityWriter.Add(space, currentUser, "note_created", "note", entity.Id,
            "added note", entity.Title ?? entity.Content[..Math.Min(24, entity.Content.Length)]);
        await dbContext.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, entity.ToResponse());
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<NoteResponse>> Update(string id, UpdateNoteRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Notes.FindAsync([id], cancellationToken);
        if (entity is null) return NotFound();
        if (request.Title is not null) entity.Title = string.IsNullOrWhiteSpace(request.Title) ? null : request.Title.Trim();
        if (request.Content is not null) entity.Content = request.Content.Trim();
        if (request.IsPinned.HasValue) entity.IsPinned = request.IsPinned.Value;
        entity.UpdatedAtUtc = timeProvider.GetUtcNow();
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(entity.ToResponse());
    }

    [HttpPost("{id}/toggle-pin")]
    public async Task<ActionResult<NoteResponse>> TogglePin(string id, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Notes.FindAsync([id], cancellationToken);
        if (entity is null) return NotFound();
        entity.IsPinned = !entity.IsPinned;
        entity.UpdatedAtUtc = timeProvider.GetUtcNow();
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(entity.ToResponse());
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Notes.FindAsync([id], cancellationToken);
        if (entity is null) return NotFound();
        dbContext.Notes.Remove(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
