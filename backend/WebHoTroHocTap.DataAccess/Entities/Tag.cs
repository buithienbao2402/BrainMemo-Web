using System;
using System.Collections.Generic;

namespace WebHoTroHocTap.DataAccess.Entities;

public class Tag
{
    public int TagId { get; set; }
    public string TagName { get; set; } = string.Empty;
    public ICollection<CourseTag> CourseTags { get; set; } = new List<CourseTag>();
}
