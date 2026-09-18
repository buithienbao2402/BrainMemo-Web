namespace WebHoTroHocTap.API.DTOs.Auth;

public class ChangePasswordWithOtpDto
{
    public string Otp { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}