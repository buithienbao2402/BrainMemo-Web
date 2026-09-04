using System.ComponentModel.DataAnnotations.Schema;

namespace WebHoTroHocTap.DataAccess.Entities;

[Table("course_tag")]
public class CourseTag
{
    [Column("course_id")]
    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;

    [Column("tag_id")]
    public int TagId { get; set; }
    public Tag Tag { get; set; } = null!;
}