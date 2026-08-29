// WebHoTroHocTap.API/DTOs/Auth/LoginRequestDto.cs
using System.ComponentModel.DataAnnotations;

namespace WebHoTroHocTap.API.DTOs.Auth
{
    public class LoginRequestDto
    {
        [Required(ErrorMessage = "Email không được để trống")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        public string Password { get; set; } = null!;
    }
}