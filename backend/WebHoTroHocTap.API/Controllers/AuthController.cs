using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using WebHoTroHocTap.Business.Services;
using WebHoTroHocTap.API.DTOs.Auth;
using WebHoTroHocTap.API.DTOs.Common;

namespace WebHoTroHocTap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
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
            var result = await _authService.LoginAsync(
                request.Email,
                request.Password
            );

            if (result == null)
            {
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Email hoặc mật khẩu không đúng"
                });
            }

            // Gửi ngầm Refresh Token qua HttpOnly Cookie với thời hạn 30 ngày[cite: 1]
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Yêu cầu HTTPS
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(30)
            };
            Response.Cookies.Append("refreshToken", result.RefreshToken, cookieOptions);

            // Trả về Envelope chứa Access Token và thông tin user cho Frontend
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

    [HttpPost("register/request-otp")]
    public async Task<IActionResult> RequestOtp([FromBody] RequestOtpDto request)
    {
        try
        {
            var (isSuccess, errorMessage) = await _authService.RequestOtpAsync(request.Email, request.Password, request.FullName);

            if (!isSuccess)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = errorMessage
                });
            }

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Mã OTP đã được gửi tới email của bạn."
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = ex.Message
            });
        }
    }

    [HttpPost("register/verify")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto request)
    {
        try
        {
            var (isSuccess, errorMessage) = await _authService.VerifyOtpAsync(request.Email, request.Otp);

            if (!isSuccess)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = errorMessage
                });
            }

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Đăng ký tài khoản thành công."
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = ex.Message
            });
        }
    }
}