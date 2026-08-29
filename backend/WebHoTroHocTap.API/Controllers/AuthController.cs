// WebHoTroHocTap.API/Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using WebHoTroHocTap.API.DTOs.Auth;
using WebHoTroHocTap.API.DTOs.Common;
using WebHoTroHocTap.Business.Services;

namespace WebHoTroHocTap.API.Controllers
{
    [ApiController]
    [Route("api/auth")] // Định tuyến không sử dụng versioning theo đúng chuẩn quy định[cite: 1]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IConfiguration _config;

        public AuthController(IAuthService authService, IConfiguration config)
        {
            _authService = authService;
            _config = config;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            try
            {
                // Truyền các cấu hình JWT từ appsettings.json xuống Business
                var jwtKey = _config["Jwt:Key"]!;
                var issuer = _config["Jwt:Issuer"]!;
                var audience = _config["Jwt:Audience"]!;

                var result = await _authService.LoginAsync(
                    request.Email,
                    request.Password,
                    jwtKey, issuer, audience
                );

                // Gửi ngầm Refresh Token qua HttpOnly Cookie với thời hạn 30 ngày[cite: 1]
                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true, // Yêu cầu HTTPS
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTime.UtcNow.AddDays(30)
                };
                Response.Cookies.Append("refreshToken", result.RefreshToken, cookieOptions);

                // Trả về Envelope chứa Access Token
                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Đăng nhập thành công",
                    Data = new
                    {
                        accessToken = result.AccessToken,
                        user = new
                        {
                            userId = result.User.UserId,
                            email = result.User.Email,
                            fullName = result.User.FullName
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                // Bắt lỗi từ tầng Business (Sai mật khẩu, tài khoản không tồn tại...)
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }
    }
}