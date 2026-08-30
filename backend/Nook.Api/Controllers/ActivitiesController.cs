using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nook.Api.Data;
using Nook.Api.Domain;

namespace Nook.Api.Controllers;

[ApiController]
[Route("api/activities")]
public sealed class ActivitiesController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<IReadOnlyList<ActivityResponse>> GetAll(CancellationToken cancellationToken)
    {
        var activities = await dbContext.Activities.AsNoTracking()
            .Include(x => x.Space)
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);
        return activities.Select(x => x.ToResponse(x.Space)).ToList();
    }
}
