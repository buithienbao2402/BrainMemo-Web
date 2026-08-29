using System;
using System.Collections.Generic;

namespace WebHoTroHocTap.DataAccess.Entities;

public partial class Page
{
    public int PageId { get; set; }

    public int ChapterId { get; set; }

    public string Title { get; set; } = null!;

    public int OrderIndex { get; set; }

    public virtual ICollection<Block> Blocks { get; set; } = new List<Block>();

    public virtual Chapter Chapter { get; set; } = null!;

    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

    public virtual ICollection<PageProgress> PageProgresses { get; set; } = new List<PageProgress>();
}
