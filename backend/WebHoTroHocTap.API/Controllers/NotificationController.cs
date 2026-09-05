using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebHoTroHocTap.API.DTOs.Common;
using WebHoTroHocTap.Business.DTOs.Notification;
using WebHoTroHocTap.Business.Services;

namespace WebHoTroHocTap.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] int limit = 20)
    {
        int userId = int.Parse(User.FindFirst("userId")!.Value);
        var result = await _notificationService.GetUserNotificationsAsync(userId, limit);
        return Ok(new ApiResponse<NotificationListDto> { Success = true, Message = "Lấy thông báo thành công", Data = result });
    }

    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        int userId = int.Parse(User.FindFirst("userId")!.Value);
        bool ok = await _notificationService.MarkAsReadAsync(id, userId);
        if (!ok) return NotFound(new ApiResponse<object> { Success = false, Message = "Không tìm thấy thông báo" });

        return Ok(new ApiResponse<object> { Success = true, Message = "Đã đánh dấu đã đọc" });
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        int userId = int.Parse(User.FindFirst("userId")!.Value);
        await _notificationService.MarkAllAsReadAsync(userId);
        return Ok(new ApiResponse<object> { Success = true, Message = "Đã đánh dấu đọc tất cả thông báo" });
    }
}