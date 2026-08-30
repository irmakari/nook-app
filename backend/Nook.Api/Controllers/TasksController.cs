using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nook.Api.Data;
using Nook.Api.Domain;

namespace Nook.Api.Controllers;

[ApiController]
[Route("api/tasks")]
public sealed class TasksController(AppDbContext dbContext, ActivityWriter activityWriter, TimeProvider timeProvider) : ControllerBase
{
    [HttpGet]
    public async Task<IReadOnlyList<TaskResponse>> GetAll([FromQuery] string? spaceId, CancellationToken cancellationToken)
    {
        var query = dbContext.Tasks.AsNoTracking();
        if (spaceId is not null) query = query.Where(x => x.SpaceId == spaceId);
        return (await query.OrderByDescending(x => x.CreatedAtUtc).ToListAsync(cancellationToken)).Select(x => x.ToResponse()).ToList();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskResponse>> Get(string id, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Tasks.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        return entity is null ? NotFound() : Ok(entity.ToResponse());
    }

    [HttpPost]
    public async Task<ActionResult<TaskResponse>> Create(CreateTaskRequest request, CancellationToken cancellationToken)
    {
        var space = await dbContext.Spaces.FindAsync([request.SpaceId], cancellationToken);
        if (space is null) return BadRequest();
        var currentUser = User.ToSpaceMember();
        var entity = new TaskEntity
        {
            Id = $"task-{Guid.NewGuid():N}", SpaceId = request.SpaceId, Title = request.Title.Trim(),
            Note = request.Note?.Trim(), AssignedTo = request.AssignedTo?.Trim(), DueAt = request.DueAt,
            Status = "open", CreatedBy = currentUser.Name, CreatedAtUtc = timeProvider.GetUtcNow()
        };
        dbContext.Tasks.Add(entity);
        activityWriter.Add(space, currentUser, "task_created", "todo", entity.Id, "added task", entity.Title);
        await dbContext.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, entity.ToResponse());
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<TaskResponse>> Update(string id, UpdateTaskRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Tasks.FindAsync([id], cancellationToken);
        if (entity is null) return NotFound();
        if (request.Title is not null) entity.Title = request.Title.Trim();
        if (request.Note is not null) entity.Note = request.Note.Trim();
        if (request.AssignedTo is not null) entity.AssignedTo = request.AssignedTo.Trim();
        if (request.DueAt is not null) entity.DueAt = request.DueAt;
        if (request.Status is not null)
        {
            if (request.Status is not ("open" or "completed"))
            {
                return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]>
                {
                    ["status"] = ["Status must be open or completed."]
                }));
            }

            entity.Status = request.Status;
            entity.CompletedAtUtc = request.Status == "completed" ? entity.CompletedAtUtc ?? timeProvider.GetUtcNow() : null;
            entity.CompletedBy = request.Status == "completed" ? entity.CompletedBy : null;
        }
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(entity.ToResponse());
    }

    [HttpPost("{id}/toggle")]
    public async Task<ActionResult<TaskResponse>> Toggle(string id, VoteRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Tasks.FindAsync([id], cancellationToken);
        if (entity is null) return NotFound();
        var complete = entity.Status == "open";
        entity.Status = complete ? "completed" : "open";
        entity.CompletedBy = complete ? request.User.Name : null;
        entity.CompletedAtUtc = complete ? timeProvider.GetUtcNow() : null;
        if (complete)
        {
            var space = await dbContext.Spaces.FindAsync([entity.SpaceId], cancellationToken);
            if (space is not null) activityWriter.Add(space, request.User, "task_completed", "todo", entity.Id, "completed", entity.Title);
        }
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(entity.ToResponse());
    }

    [HttpPost("{id}/claim")]
    public async Task<ActionResult<TaskResponse>> Claim(string id, VoteRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Tasks.FindAsync([id], cancellationToken);
        if (entity is null) return NotFound();
        entity.AssignedTo = request.User.Name;
        var space = await dbContext.Spaces.FindAsync([entity.SpaceId], cancellationToken);
        if (space is not null) activityWriter.Add(space, request.User, "task_claimed", "todo", entity.Id, "took", entity.Title);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(entity.ToResponse());
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Tasks.FindAsync([id], cancellationToken);
        if (entity is null) return NotFound();
        dbContext.Tasks.Remove(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
