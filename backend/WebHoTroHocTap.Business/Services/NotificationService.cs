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

    public async Task CreateNotificationAsync(int userId, string type, string content,
        string? relatedEntityType = null, int? relatedEntityId = null)
    {
        _context.Notifications.Add(new Notification
        {
            UserId = userId,
            Type = type,
            Content = content,
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
            RelatedEntityType = relatedEntityType,
            RelatedEntityId = relatedEntityId
        });
        await _context.SaveChangesAsync();
    }

    // Triển khai phương thức gửi thông báo hàng loạt cho danh sách User
    public async Task CreateNotificationsAsync(IEnumerable<int> userIds, string type, string content)
    {
        var distinctIds = userIds.Distinct().ToList();
        if (distinctIds.Count == 0) return;

        var now = DateTime.UtcNow;
        var notifications = distinctIds.Select(uid => new Notification
        {
            UserId = uid,
            Type = type,
            Content = content,
            IsRead = false,
            CreatedAt = now
        });

        _context.Notifications.AddRange(notifications);
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

        var rows = await query
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(n => new
            {
                n.NotificationId,
                n.Type,
                n.Content,
                n.IsRead,
                n.CreatedAt,
                n.RelatedEntityType,
                n.RelatedEntityId
            })
            .ToListAsync();

        // Gắn trạng thái lời mời (PENDING/ACCEPTED/DECLINED) + courseId cho notification COURSE_INVITATION
        var invitationIds = rows
            .Where(r => r.RelatedEntityType == "course_invitation" && r.RelatedEntityId.HasValue)
            .Select(r => r.RelatedEntityId!.Value)
            .Distinct()
            .ToList();

        var invitationMap = invitationIds.Count == 0
            ? new Dictionary<int, (string Status, int CourseId)>()
            : (await _context.CourseInvitations
                .Where(i => invitationIds.Contains(i.InvitationId))
                .Select(i => new { i.InvitationId, i.Status, i.CourseId })
                .ToListAsync())
                .ToDictionary(i => i.InvitationId, i => (i.Status, i.CourseId));

        var items = rows.Select(r =>
        {
            string? invitationStatus = null;
            int? courseId = null;

            if (r.RelatedEntityType == "course_invitation" && r.RelatedEntityId.HasValue
                && invitationMap.TryGetValue(r.RelatedEntityId.Value, out var inv))
            {
                invitationStatus = inv.Status;
                courseId = inv.CourseId;
            }
            else if (r.RelatedEntityType == "course")
            {
                courseId = r.RelatedEntityId;
            }

            return new
            {
                id = r.NotificationId,
                type = r.Type,
                content = r.Content,
                isRead = r.IsRead,
                createdAt = r.CreatedAt,
                relatedEntityType = r.RelatedEntityType,
                relatedEntityId = r.RelatedEntityId,
                courseId,
                invitationStatus
            };
        }).ToList();

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