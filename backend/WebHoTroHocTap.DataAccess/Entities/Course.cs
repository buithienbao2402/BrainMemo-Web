using System;
using System.Collections.Generic;

namespace WebHoTroHocTap.DataAccess.Entities;

public partial class Course
{
    public int CourseId { get; set; }

    public int CreatorId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public string? CoverImage { get; set; }

    public string AccessType { get; set; } = null!;

    public string? Passcode { get; set; }

    public string Status { get; set; } = null!;

    public ICollection<CourseTag> CourseTags { get; set; } = new List<CourseTag>();

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<Chapter> Chapters { get; set; } = new List<Chapter>();

    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public virtual ICollection<CourseInvitation> CourseInvitations { get; set; } = new List<CourseInvitation>();

    public virtual User Creator { get; set; } = null!;

    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

    public virtual ICollection<Tag> Tags { get; set; } = new List<Tag>();
}
