using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebHoTroHocTap.API.DTOs.Common;
using WebHoTroHocTap.Business.DTOs.User;
using WebHoTroHocTap.Business.Services;

namespace WebHoTroHocTap.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    // Giữ nguyên endpoint me (hỗ trợ cả /api/users/me và /api/users/profile)
    [HttpGet("me")]
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        int userId = GetCurrentUserId();
        var profile = await _userService.GetProfileAsync(userId);
        if (profile == null)
            return NotFound(new ApiResponse<object> { Success = false, Message = "Không tìm thấy người dùng" });

        return Ok(new ApiResponse<UserProfileResponseDto>
        {
            Success = true,
            Message = "Lấy hồ sơ người dùng thành công",
            Data = profile
        });
    }

    // Cập nhật thông tin cá nhân (họ tên, bio, avatar, cài đặt thông báo)
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequestDto dto)
    {
        int userId = GetCurrentUserId();
        bool success = await _userService.UpdateProfileAsync(userId, dto);
        if (!success)
            return BadRequest(new ApiResponse<object> { Success = false, Message = "Cập nhật hồ sơ thất bại" });

        return Ok(new ApiResponse<object> { Success = true, Message = "Cập nhật thông tin thành công" });
    }

    // Cập nhật chế độ sáng/tối (LIGHT / DARK)
    [HttpPatch("theme")]
    public async Task<IActionResult> UpdateTheme([FromBody] UpdateThemeRequestDto dto)
    {
        int userId = GetCurrentUserId();
        bool success = await _userService.UpdateThemeAsync(userId, dto.ThemeMode);
        if (!success)
            return BadRequest(new ApiResponse<object> { Success = false, Message = "Đổi giao diện thất bại" });

        return Ok(new ApiResponse<object> { Success = true, Message = "Cập nhật giao diện thành công" });
    }

    // Đổi mật khẩu
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto dto)
    {
        try
        {
            int userId = GetCurrentUserId();
            await _userService.ChangePasswordAsync(userId, dto);
            return Ok(new ApiResponse<object> { Success = true, Message = "Đổi mật khẩu thành công" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
        }
    }

    // Đăng xuất và thu hồi Refresh Token
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutRequestDto? dto)
    {
        int userId = GetCurrentUserId();
        await _userService.LogoutAsync(userId, dto?.RefreshToken);
        return Ok(new ApiResponse<object> { Success = true, Message = "Đăng xuất thành công" });
    }

    private int GetCurrentUserId() => int.Parse(User.FindFirst("userId")!.Value);
}