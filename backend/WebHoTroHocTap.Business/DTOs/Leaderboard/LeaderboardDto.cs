namespace WebHoTroHocTap.Business.DTOs.Leaderboard;

public class LeaderboardDto
{
    public int Rank { get; set; }
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public int TotalScore { get; set; }
    public int CompletedLessonsCount { get; set; }
    public int PassedQuizzesCount { get; set; }
    public int CompletedCoursesCount { get; set; }
}