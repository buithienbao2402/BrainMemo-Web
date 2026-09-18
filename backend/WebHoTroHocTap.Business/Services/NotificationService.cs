using Microsoft.EntityFrameworkCore;
using WebHoTroHocTap.DataAccess;
using WebHoTroHocTap.DataAccess.Entities;

namespace WebHoTroHocTap.Business.Services;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _context;
    public NotificationService(AppDbContext context) => _context = context;

    public async Task CreateNotificationAsync(int userId, string type, string content)
    {
        _context.Notifications.Add(new Notification
        {
            UserId = userId,
            Type = type,
            Content = content,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();
    }

    public async Task CreateNotificationsAsync(IEnumerable<int> userIds, string type, string content)
    {
        foreach (var uid in userIds.Distinct())
        {
            _context.Notifications.Add(new Notification
            {
                UserId = uid,
                Type = type,
                Content = content,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });
        }
        await _context.SaveChangesAsync();
    }

    public async Task<object> GetNotificationsAsync(int userId, int page, int pageSize)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 20 : Math.Min(pageSize, 100);

        var query = _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt);

        int totalItems = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(n => new
            {
                id = n.NotificationId,
                type = n.Type,
                content = n.Content,
                isRead = n.IsRead,
                createdAt = n.CreatedAt
            })
            .ToListAsync();

        int unreadCount = await _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);

        return new
        {
            items,
            page,
            pageSize,
            totalItems,
            totalPages = (int)Math.Ceiling(totalItems / (double)pageSize),
            unreadCount
        };
    }

    public Task<int> GetUnreadCountAsync(int userId) =>
        _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);

    public async Task MarkAllAsReadAsync(int userId)
    {
        var unread = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var n in unread) n.IsRead = true;
        await _context.SaveChangesAsync();
    }
}