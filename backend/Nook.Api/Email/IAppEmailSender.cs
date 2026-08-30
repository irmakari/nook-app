using Nook.Api.Auth;

namespace Nook.Api.Email;

public interface IAppEmailSender
{
    Task SendPasswordResetAsync(ApplicationUser user, string encodedToken, CancellationToken cancellationToken);
}
