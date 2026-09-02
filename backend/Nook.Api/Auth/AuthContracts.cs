using System.ComponentModel.DataAnnotations;

namespace Nook.Api.Auth;

public sealed record RegisterRequest(
    [param: Required, EmailAddress, MaxLength(256)] string Email,
    [param: Required, MinLength(8), MaxLength(128)] string Password,
    [param: MaxLength(128)] string? FullName = null,
    [param: MaxLength(32)] string? PhoneNumber = null);

public sealed record LoginRequest(
    [param: Required, EmailAddress, MaxLength(256)] string Email,
    [param: Required, MaxLength(128)] string Password);

public sealed record SendVerificationRequest(
    [param: Required, EmailAddress, MaxLength(256)] string Email);

public sealed record VerifyCodeRequest(
    [param: Required, EmailAddress, MaxLength(256)] string Email,
    [param: Required, MinLength(4), MaxLength(10)] string Code);

public sealed record ForgotPasswordRequest(
    [param: Required, EmailAddress, MaxLength(256)] string Email);

public sealed record ResetPasswordRequest(
    [param: Required, EmailAddress, MaxLength(256)] string Email,
    [param: Required] string Token,
    [param: Required, MinLength(8), MaxLength(128)] string NewPassword);

public sealed record AuthResponse(string AccessToken, DateTimeOffset ExpiresAtUtc, UserResponse User);

public sealed record UserResponse(Guid Id, string Email, string Name, string Initials, DateTime CreatedAtUtc)
{
    public static UserResponse From(ApplicationUser user) =>
        new(user.Id, user.Email ?? string.Empty, NameFrom(user), InitialsFrom(user), user.CreatedAtUtc);

    private static string NameFrom(ApplicationUser user)
    {
        if (!string.IsNullOrWhiteSpace(user.FullName))
        {
            return user.FullName.Trim();
        }
        var source = user.UserName ?? user.Email ?? "User";
        var localPart = source.Split('@', 2)[0];
        var cleaned = localPart.Replace('.', ' ').Replace('_', ' ').Replace('-', ' ').Trim();
        return string.IsNullOrWhiteSpace(cleaned)
            ? "User"
            : string.Join(' ', cleaned.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Select(part => char.ToUpperInvariant(part[0]) + part[1..]));
    }

    private static string InitialsFrom(ApplicationUser user)
    {
        var parts = NameFrom(user).Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return parts.Length == 0
            ? "US"
            : string.Concat(parts.Take(2).Select(part => char.ToUpperInvariant(part[0])));
    }
}

public sealed record MessageResponse(string Message);
