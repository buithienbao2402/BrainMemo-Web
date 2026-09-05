using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebHoTroHocTap.Business.DTOs.Notification;

namespace WebHoTroHocTap.Business.Services;

public interface INotificationService
{
    Task<NotificationListDto> GetUserNotificationsAsync(int userId, int limit = 20);
    Task<bool> MarkAsReadAsync(int notificationId, int userId);
    Task<bool> MarkAllAsReadAsync(int userId);
}
