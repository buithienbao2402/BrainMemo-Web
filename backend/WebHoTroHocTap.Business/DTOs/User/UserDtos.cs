using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebHoTroHocTap.Business.DTOs.User;

public class UserProfileResponseDto
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public string ThemeMode { get; set; } = "LIGHT";
    public bool NotificationEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateProfileRequestDto
{
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public bool NotificationEnabled { get; set; } = true;
}

public class UpdateThemeRequestDto
{
    public string ThemeMode { get; set; } = "LIGHT"; // "LIGHT" hoặc "DARK"
}

public class ChangePasswordRequestDto
{
    public string OldPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class LogoutRequestDto
{
    public string RefreshToken { get; set; } = string.Empty;
}