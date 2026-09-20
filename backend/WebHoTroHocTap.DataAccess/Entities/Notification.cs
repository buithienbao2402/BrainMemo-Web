using System.ComponentModel.DataAnnotations.Schema;
namespace WebHoTroHocTap.DataAccess.Entities;

public partial class Notification
{
    public int NotificationId { get; set; }
    public int UserId { get; set; }
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }

    // "course_invitation" (id = InvitationId) hoặc "course" (id = CourseId)
    [Column("related_entity_type")]
    public string? RelatedEntityType { get; set; }

    [Column("related_entity_id")]
    public int? RelatedEntityId { get; set; }

    public virtual User User { get; set; } = null!;
}