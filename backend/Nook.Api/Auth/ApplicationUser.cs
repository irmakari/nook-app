using Microsoft.AspNetCore.Identity;

namespace Nook.Api.Auth;

public sealed class ApplicationUser : IdentityUser<Guid>
{
    public DateTime CreatedAtUtc { get; init; } = DateTime.UtcNow;
}
