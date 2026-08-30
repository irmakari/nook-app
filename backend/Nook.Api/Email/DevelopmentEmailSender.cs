using Nook.Api.Auth;

namespace Nook.Api.Email;

public sealed class DevelopmentEmailSender(ILogger<DevelopmentEmailSender> logger) : IAppEmailSender
{
    public Task SendPasswordResetAsync(
        ApplicationUser user,
        string encodedToken,
        CancellationToken cancellationToken)
    {
        logger.LogWarning(
            "Development password reset token for {Email}: {ResetToken}",
            user.Email,
            encodedToken);
        return Task.CompletedTask;
    }
}
