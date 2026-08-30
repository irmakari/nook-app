using Nook.Api.Auth;

namespace Nook.Api.Email;

public sealed class UnconfiguredEmailSender(ILogger<UnconfiguredEmailSender> logger) : IAppEmailSender
{
    public Task SendPasswordResetAsync(
        ApplicationUser user,
        string encodedToken,
        CancellationToken cancellationToken)
    {
        logger.LogError(
            "Password reset was requested for {Email}, but no production email provider is configured.",
            user.Email);
        return Task.CompletedTask;
    }
}
