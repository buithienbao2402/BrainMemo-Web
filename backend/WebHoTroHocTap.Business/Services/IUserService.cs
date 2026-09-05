using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebHoTroHocTap.Business.DTOs.User;

namespace WebHoTroHocTap.Business.Services;

public interface IUserService
{
    Task<UserProfileResponseDto?> GetProfileAsync(int userId);
    Task<bool> UpdateProfileAsync(int userId, UpdateProfileRequestDto dto);
    Task<bool> UpdateThemeAsync(int userId, string themeMode);
    Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequestDto dto);
    Task<bool> LogoutAsync(int userId, string? refreshToken);
}