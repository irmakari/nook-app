using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nook.Api.Data;
using Nook.Api.Domain;

namespace Nook.Api.Controllers;

[ApiController]
[Route("api/lists")]
public sealed class ListsController(AppDbContext dbContext, ActivityWriter activityWriter, TimeProvider timeProvider) : ControllerBase
{
    [HttpGet]
    public async Task<IReadOnlyList<SharedListResponse>> GetAll([FromQuery] string? spaceId, CancellationToken cancellationToken)
    {
        var query = dbContext.SharedLists.AsNoTracking();
        if (spaceId is not null) query = query.Where(x => x.SpaceId == spaceId);
        return (await query.OrderByDescending(x => x.CreatedAtUtc).ToListAsync(cancellationToken)).Select(x => x.ToResponse()).ToList();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SharedListResponse>> Get(string id, CancellationToken cancellationToken)
    {
        var entity = await dbContext.SharedLists.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        return entity is null ? NotFound() : Ok(entity.ToResponse());
    }

    [HttpPost]
    public async Task<ActionResult<SharedListResponse>> Create(CreateListRequest request, CancellationToken cancellationToken)
    {
        var space = await dbContext.Spaces.FindAsync([request.SpaceId], cancellationToken);
        if (space is null) return BadRequest();
        var currentUser = User.ToSpaceMember();
        var entity = new SharedListEntity
        {
            Id = $"list-{Guid.NewGuid():N}", SpaceId = request.SpaceId, Name = request.Name.Trim(),
            Description = request.Description?.Trim(), Template = request.Template,
            CreatedBy = currentUser.Name, CreatedAtUtc = timeProvider.GetUtcNow(),
            ItemsJson = DomainJson.Write(Array.Empty<SharedListItem>())
        };
        dbContext.SharedLists.Add(entity);
        activityWriter.Add(space, currentUser, "list_created", "list", entity.Id, "created list", entity.Name);
        await dbContext.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, entity.ToResponse());
    }

    [HttpPost("{id}/items")]
    public async Task<ActionResult<SharedListResponse>> AddItem(string id, AddListItemRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.SharedLists.FindAsync([id], cancellationToken);
        if (entity is null) return NotFound();
        var items = DomainJson.ReadList<SharedListItem>(entity.ItemsJson);
        items.Add(new SharedListItem($"item-{Guid.NewGuid():N}", id, request.Text.Trim(), request.Note?.Trim(),
            request.User.Name, false, null, null, timeProvider.GetUtcNow()));
        entity.ItemsJson = DomainJson.Write(items);
        var space = await dbContext.Spaces.FindAsync([entity.SpaceId], cancellationToken);
        if (space is not null) activityWriter.Add(space, request.User, "list_item_added", "list", id, $"added \"{request.Text.Trim()}\" to", entity.Name);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(entity.ToResponse());
    }

    [HttpPost("{id}/items/{itemId}/toggle")]
    public async Task<ActionResult<SharedListResponse>> ToggleItem(string id, string itemId, VoteRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.SharedLists.FindAsync([id], cancellationToken);
        if (entity is null) return NotFound();
        var items = DomainJson.ReadList<SharedListItem>(entity.ItemsJson);
        var index = items.FindIndex(x => x.Id == itemId);
        if (index < 0) return NotFound();
        var item = items[index];
        items[index] = item with
        {
            Completed = !item.Completed,
            CompletedBy = item.Completed ? null : request.User.Name,
            CompletedAt = item.Completed ? null : timeProvider.GetUtcNow()
        };
        entity.ItemsJson = DomainJson.Write(items);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(entity.ToResponse());
    }

    [HttpDelete("{id}/items/{itemId}")]
    public async Task<ActionResult<SharedListResponse>> DeleteItem(string id, string itemId, CancellationToken cancellationToken)
    {
        var entity = await dbContext.SharedLists.FindAsync([id], cancellationToken);
        if (entity is null) return NotFound();
        var items = DomainJson.ReadList<SharedListItem>(entity.ItemsJson);
        items.RemoveAll(x => x.Id == itemId);
        entity.ItemsJson = DomainJson.Write(items);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(entity.ToResponse());
    }

    [HttpPost("{id}/clear-completed")]
    public async Task<ActionResult<SharedListResponse>> ClearCompleted(string id, CancellationToken cancellationToken)
    {
        var entity = await dbContext.SharedLists.FindAsync([id], cancellationToken);
        if (entity is null) return NotFound();
        var items = DomainJson.ReadList<SharedListItem>(entity.ItemsJson);
        items.RemoveAll(x => x.Completed);
        entity.ItemsJson = DomainJson.Write(items);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(entity.ToResponse());
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        var entity = await dbContext.SharedLists.FindAsync([id], cancellationToken);
        if (entity is null) return NotFound();
        dbContext.SharedLists.Remove(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
