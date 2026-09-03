namespace WebHoTroHocTap.API.DTOs.Auth;

// Dùng cho bước 1: Yêu cầu OTP
public class RequestOtpDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
}

// Dùng cho bước 2: Xác nhận OTP
public class VerifyOtpDto
{
    public string Email { get; set; } = string.Empty;
    public string Otp { get; set; } = string.Empty;
}