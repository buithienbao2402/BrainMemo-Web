using System;
using System.Collections.Generic;

namespace WebHoTroHocTap.DataAccess.Entities;

public partial class PageProgress
{
    public int ProgressId { get; set; }

    public int EnrollmentId { get; set; }

    public int PageId { get; set; }

    public bool IsCompleted { get; set; }

    public DateTime? CompletedAt { get; set; }

    public virtual Enrollment Enrollment { get; set; } = null!;

    public virtual Page Page { get; set; } = null!;
}
