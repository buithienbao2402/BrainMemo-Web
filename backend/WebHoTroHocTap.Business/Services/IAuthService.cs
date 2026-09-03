using WebHoTroHocTap.Business.DTOs;

namespace WebHoTroHocTap.Business.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(string email, string password);

    Task<(bool IsSuccess, string ErrorMessage)> RequestOtpAsync(string email, string password, string fullName);
    Task<(bool IsSuccess, string ErrorMessage)> VerifyOtpAsync(string email, string otp);

    Task<string?> RefreshTokenAsync(string rawRefreshToken);
}