// backend/WebHoTroHocTap.API/DTOs/User/UpdateProfileDto.cs
namespace WebHoTroHocTap.API.DTOs.User;

public class UpdateProfileDto
{
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public bool NotificationEnabled { get; set; } = true;
    public string ThemeMode { get; set; } = "LIGHT"; // "LIGHT" | "DARK"
}