using WebHoTroHocTap.Business.DTOs;

namespace WebHoTroHocTap.Business.Services;

public interface IAuthService
{
    // Đổi Task<string?> thành Task<LoginResponseDto?>
    Task<LoginResponseDto?> LoginAsync(string email, string password);
}