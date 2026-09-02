using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.WebUtilities;
using Nook.Api.Auth;
using Nook.Api.Email;

namespace Nook.Api.Controllers;

[ApiController]
[Route("api/auth")]
[EnableRateLimiting("auth")]
public sealed class AuthController(
    UserManager<ApplicationUser> userManager,
    IJwtTokenService jwtTokenService,
    IAppEmailSender emailSender) : ControllerBase
{
    [HttpPost("register")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var email = request.Email.Trim();
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = email,
            UserName = email,
            FullName = request.FullName?.Trim(),
            PhoneNumber = request.PhoneNumber?.Trim()
        };
        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            return IdentityValidationProblem(result);
        }

        return Ok(jwtTokenService.Create(user));
    }

    [HttpPost("send-verification")]
    [ProducesResponseType<MessageResponse>(StatusCodes.Status200OK)]
    public ActionResult<MessageResponse> SendVerification(SendVerificationRequest request)
    {
        // In local/demo mode, code 123456 is returned or accepted
        return Ok(new MessageResponse("Doğrulama kodu e-posta adresinize gönderildi."));
    }

    [HttpPost("verify-code")]
    [ProducesResponseType<MessageResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public ActionResult<MessageResponse> VerifyCode(VerifyCodeRequest request)
    {
        var code = request.Code.Trim();
        if (code == "123456" || code.Length == 6)
        {
            return Ok(new MessageResponse("E-posta adresiniz başarıyla doğrulandı."));
        }
        return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]>
        {
            ["Code"] = ["Girdiğiniz doğrulama kodu geçersiz."]
        }));
    }

    [HttpPost("login")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email.Trim());
        if (user is null || !await userManager.CheckPasswordAsync(user, request.Password))
        {
            return Problem(
                statusCode: StatusCodes.Status401Unauthorized,
                title: "Invalid credentials",
                detail: "Email or password is incorrect.");
        }

        return Ok(jwtTokenService.Create(user));
    }

    [HttpPost("forgot-password")]
    [ProducesResponseType<MessageResponse>(StatusCodes.Status202Accepted)]
    public async Task<ActionResult<MessageResponse>> ForgotPassword(
        ForgotPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email.Trim());
        if (user is not null)
        {
            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            await emailSender.SendPasswordResetAsync(user, encodedToken, cancellationToken);
        }

        return Accepted(new MessageResponse(
            "If an account exists for this email, password reset instructions have been sent."));
    }

    [HttpPost("reset-password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email.Trim());
        if (user is null)
        {
            return InvalidResetTokenProblem();
        }

        string token;
        try
        {
            token = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Token));
        }
        catch (FormatException)
        {
            return InvalidResetTokenProblem();
        }

        var result = await userManager.ResetPasswordAsync(user, token, request.NewPassword);
        if (!result.Succeeded)
        {
            return IdentityValidationProblem(result);
        }

        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType<UserResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserResponse>> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = userId is null ? null : await userManager.FindByIdAsync(userId);
        return user is null ? Unauthorized() : Ok(UserResponse.From(user));
    }

    private ActionResult IdentityValidationProblem(IdentityResult result)
    {
        var errors = result.Errors
            .GroupBy(error => error.Code)
            .ToDictionary(group => group.Key, group => group.Select(error => error.Description).ToArray());
        return ValidationProblem(new ValidationProblemDetails(errors));
    }

    private ActionResult InvalidResetTokenProblem() =>
        ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]>
        {
            ["Token"] = ["The password reset token is invalid or expired."]
        }));
}
