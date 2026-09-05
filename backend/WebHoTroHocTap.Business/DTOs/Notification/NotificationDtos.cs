using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebHoTroHocTap.Business.DTOs.Notification;

public class NotificationResponseDto
{
    public int NotificationId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class NotificationListDto
{
    public int UnreadCount { get; set; }
    public List<NotificationResponseDto> Items { get; set; } = new();
}
