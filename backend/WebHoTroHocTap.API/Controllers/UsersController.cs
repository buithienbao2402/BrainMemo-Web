using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebHoTroHocTap.API.DTOs.Common;
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
                avatarUrl = user.AvatarUrl
            }
        });
    }
}