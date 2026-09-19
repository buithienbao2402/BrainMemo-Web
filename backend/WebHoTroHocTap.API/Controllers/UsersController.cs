using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebHoTroHocTap.API.DTOs.Common;
using WebHoTroHocTap.API.DTOs.User;
using WebHoTroHocTap.DataAccess;

namespace WebHoTroHocTap.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize] // Bắt buộc có access token hợp lệ trong header Authorization
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    public UsersController(AppDbContext context) => _context = context;

    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new ApiResponse<object> { Success = false, Message = "Token không hợp lệ." });
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound(new ApiResponse<object> { Success = false, Message = "Không tìm thấy người dùng." });
        }

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Lấy thông tin thành công",
            Data = new
            {
                userId = user.UserId,
                email = user.Email,
                fullName = user.FullName,
                avatarUrl = user.AvatarUrl,
                bio = user.Bio,
                notificationEnabled = user.NotificationEnabled ?? true,
                themeMode = user.ThemeMode
            }
        });
    }

    // MỚI: cập nhật thông tin cá nhân + cài đặt (thông báo, theme) — lưu theo đúng user_id
    // đang đăng nhập (lấy từ JWT claim), không ảnh hưởng tài khoản khác.
    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateProfileDto dto)
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new ApiResponse<object> { Success = false, Message = "Token không hợp lệ." });
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound(new ApiResponse<object> { Success = false, Message = "Không tìm thấy người dùng." });
        }

        var normalizedTheme = dto.ThemeMode?.Trim().ToUpperInvariant();
        if (normalizedTheme != "LIGHT" && normalizedTheme != "DARK")
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "themeMode chỉ chấp nhận giá trị LIGHT hoặc DARK.",
                Errors = new object[]
                {
                    new { field = "themeMode", code = "INVALID_VALUE", message = "Giá trị không hợp lệ." }
                }
            });
        }

        user.FullName = dto.FullName;
        user.AvatarUrl = dto.AvatarUrl;
        user.Bio = dto.Bio;
        user.NotificationEnabled = dto.NotificationEnabled;
        user.ThemeMode = normalizedTheme;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Cập nhật thông tin thành công",
            Data = new
            {
                userId = user.UserId,
                email = user.Email,
                fullName = user.FullName,
                avatarUrl = user.AvatarUrl,
                bio = user.Bio,
                notificationEnabled = user.NotificationEnabled ?? true,
                themeMode = user.ThemeMode
            }
        });
    }

    [HttpPost("me/heartbeat")]
    public async Task<IActionResult> Heartbeat()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new ApiResponse<object> { Success = false, Message = "Token không hợp lệ." });
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound(new ApiResponse<object> { Success = false, Message = "Không tìm thấy người dùng." });
        }

        user.TotalActiveSeconds += 60;
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "OK",
            Data = new { totalActiveSeconds = user.TotalActiveSeconds }
        });
    }
}