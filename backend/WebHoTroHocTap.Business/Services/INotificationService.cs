namespace WebHoTroHocTap.Business.Services;

public interface INotificationService
{
    Task CreateNotificationAsync(int userId, string type, string content);
    Task CreateNotificationsAsync(IEnumerable<int> userIds, string type, string content);
    Task<object> GetNotificationsAsync(int userId, int page, int pageSize);
    Task<int> GetUnreadCountAsync(int userId);
    Task MarkAllAsReadAsync(int userId);
}