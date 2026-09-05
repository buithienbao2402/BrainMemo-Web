using System;
using System.Collections.Generic;

namespace WebHoTroHocTap.DataAccess.Entities;

public partial class Chapter
{
    public int ChapterId { get; set; }

    public int CourseId { get; set; }

    public string Title { get; set; } = null!;

    public int OrderIndex { get; set; }

    public string AccessType { get; set; } = null!;

    public string? Passcode { get; set; }

    public bool IsDraft { get; set; } = false;

    public DateTime CreatedAt { get; set; }

    public virtual Course Course { get; set; } = null!;

    public virtual ICollection<Page> Pages { get; set; } = new List<Page>();
}
