using System;
using System.Collections.Generic;

namespace WebHoTroHocTap.DataAccess.Entities;

public partial class CourseInvitation
{
    public int InvitationId { get; set; }

    public int CourseId { get; set; }

    public int InviterId { get; set; }

    public string InviteeEmail { get; set; } = null!;

    public int? InviteeUserId { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime? RespondedAt { get; set; }

    public virtual Course Course { get; set; } = null!;

    public virtual User? InviteeUser { get; set; }

    public virtual User Inviter { get; set; } = null!;
}
