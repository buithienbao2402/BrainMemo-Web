using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebHoTroHocTap.Business.DTOs.Notification;
using WebHoTroHocTap.DataAccess;

namespace WebHoTroHocTap.Business.Services;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _context;

    public NotificationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<NotificationListDto> GetUserNotificationsAsync(int userId, int limit = 20)
    {
        var items = await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(limit)
            .Select(n => new NotificationResponseDto
            {
                NotificationId = n.NotificationId,
                Type = n.Type,
                Content = n.Content,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt,
            })
            .ToListAsync();

        int unreadCount = await _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);

        return new NotificationListDto
        {
            UnreadCount = unreadCount,
            Items = items
        };
    }

    public async Task<bool> MarkAsReadAsync(int notificationId, int userId)
    {
        var notif = await _context.Notifications.FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.UserId == userId);
        if (notif == null) return false;

        notif.IsRead = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> MarkAllAsReadAsync(int userId)
    {
        var unreadList = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var n in unreadList)
        {
            n.IsRead = true;
        }

        await _context.SaveChangesAsync();
        return true;
    }
}
