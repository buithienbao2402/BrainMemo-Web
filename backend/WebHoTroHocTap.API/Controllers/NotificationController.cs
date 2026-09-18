using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebHoTroHocTap.API.DTOs.Common;
using WebHoTroHocTap.Business.Services;

namespace WebHoTroHocTap.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _notificationService;
    public NotificationController(INotificationService notificationService) => _notificationService = notificationService;

    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        int userId = GetCurrentUserId()!.Value;
        var result = await _notificationService.GetNotificationsAsync(userId, page, pageSize);
        return Ok(new ApiResponse<object> { Success = true, Message = "Lấy danh sách thông báo thành công", Data = result });
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        int userId = GetCurrentUserId()!.Value;
        int count = await _notificationService.GetUnreadCountAsync(userId);
        return Ok(new ApiResponse<object> { Success = true, Message = "OK", Data = new { unreadCount = count } });
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        int userId = GetCurrentUserId()!.Value;
        await _notificationService.MarkAllAsReadAsync(userId);
        return Ok(new ApiResponse<object> { Success = true, Message = "Đã đánh dấu tất cả đã đọc" });
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst("userId");
        return claim != null && int.TryParse(claim.Value, out int userId) ? userId : null;
    }
}