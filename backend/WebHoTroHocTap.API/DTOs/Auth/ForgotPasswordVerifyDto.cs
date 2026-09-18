namespace WebHoTroHocTap.API.DTOs.Auth;

public class ForgotPasswordVerifyDto
{
    public string Email { get; set; } = string.Empty;
    public string Otp { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}