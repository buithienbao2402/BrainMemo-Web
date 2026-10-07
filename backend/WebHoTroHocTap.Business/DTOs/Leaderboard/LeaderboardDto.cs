namespace WebHoTroHocTap.Business.DTOs.Leaderboard;

public class TopCourseDto
{
    public int Rank { get; set; }
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? CoverImage { get; set; }
    public string CreatorName { get; set; } = string.Empty;
    public int ParticipantsCount { get; set; }
}

public class TopCreatorDto
{
    public int Rank { get; set; }
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    /// <summary>Số học viên KHÁC NHAU (distinct user_id) trong tất cả khóa học của creator.</summary>
    public int StudentsCount { get; set; }
    public int CoursesCount { get; set; }
}