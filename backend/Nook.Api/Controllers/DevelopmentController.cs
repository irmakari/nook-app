using Microsoft.AspNetCore.Mvc;
using Nook.Api.Data;

namespace Nook.Api.Controllers;

[ApiController]
[Route("api/development")]
public sealed class DevelopmentController(DatabaseSeeder seeder, IWebHostEnvironment environment) : ControllerBase
{
    [HttpPost("seed")]
    public async Task<ActionResult<SeedResult>> Seed(CancellationToken cancellationToken)
    {
        if (!environment.IsDevelopment()) return NotFound();
        return Ok(await seeder.SeedAsync(cancellationToken));
    }
}
