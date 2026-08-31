using System;
using System.Collections.Generic;

namespace WebHoTroHocTap.DataAccess.Entities;

public partial class Enrollment
{
    public int EnrollmentId { get; set; }

    public int UserId { get; set; }

    public int CourseId { get; set; }

    public DateTime EnrolledAt { get; set; }

    public string Status { get; set; } = null!;

    public decimal ProgressPercent { get; set; }

    public int? LastPageId { get; set; }

    public DateTime? LastAccessedAt { get; set; }

    public virtual Course Course { get; set; } = null!;

    public virtual Page? LastPage { get; set; }

    public virtual ICollection<PageProgress> PageProgresses { get; set; } = new List<PageProgress>();

    public virtual User User { get; set; } = null!;
}
