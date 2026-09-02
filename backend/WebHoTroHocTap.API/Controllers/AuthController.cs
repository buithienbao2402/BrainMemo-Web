using Microsoft.AspNetCore.Mvc;
using WebHoTroHocTap.Business.Services;
using WebHoTroHocTap.Business.DTOs;
using WebHoTroHocTap.API.DTOs.Auth;
using WebHoTroHocTap.API.DTOs.Common;

namespace WebHoTroHocTap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var result = await _authService.LoginAsync(request.Email, request.Password);

        if (result == null)
        {
            return Unauthorized(new ApiResponse<object>
            {
                Success = false,
                Message = "Email hoặc mật khẩu không chính xác."
            });
        }

        return Ok(new ApiResponse<LoginResponseDto>
        {
            Success = true,
            Message = "Đăng nhập thành công.",
            Data = result
        });
    }
}