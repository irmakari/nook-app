namespace Nook.Api.Auth;

public interface IJwtTokenService
{
    AuthResponse Create(ApplicationUser user);
}
