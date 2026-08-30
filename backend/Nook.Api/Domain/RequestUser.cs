using System.Security.Claims;
using System.Text.RegularExpressions;

namespace Nook.Api.Domain;

public static partial class RequestUser
{
    public static SpaceMember ToSpaceMember(this ClaimsPrincipal principal)
    {
        var id = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = principal.FindFirstValue(ClaimTypes.Email) ?? principal.FindFirstValue("email");
        var name = principal.Identity?.Name;

        if (string.IsNullOrWhiteSpace(name) && !string.IsNullOrWhiteSpace(email))
        {
            name = email.Split('@', 2)[0];
        }

        if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name))
        {
            return DomainDefaults.CurrentUser;
        }

        name = HumanizeName(name);
        return new SpaceMember(id, name, InitialsFor(name), "member");
    }

    private static string HumanizeName(string value)
    {
        var cleaned = Separators().Replace(value.Trim(), " ");
        return string.Join(' ', cleaned.Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Select(part => char.ToUpperInvariant(part[0]) + part[1..]));
    }

    private static string InitialsFor(string name)
    {
        var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return "??";
        return string.Concat(parts.Take(2).Select(part => char.ToUpperInvariant(part[0])));
    }

    [GeneratedRegex("[._-]+")]
    private static partial Regex Separators();
}
