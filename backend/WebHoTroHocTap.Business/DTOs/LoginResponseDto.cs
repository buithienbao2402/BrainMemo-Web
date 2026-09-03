namespace WebHoTroHocTap.Business.DTOs;

public class UserDto
{
    public int UserId { get; set; } // Nếu trong DB là kiểu string/Guid thì đổi kiểu tương ứng
    public string Email { get; set; } = string.Empty;
    public string? FullName { get; set; }
}

public class LoginResponseDto
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
}