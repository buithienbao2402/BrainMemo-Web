using WebHoTroHocTap.Business.DTOs.Leaderboard;

namespace WebHoTroHocTap.Business.Services;

public interface ILeaderboardService
{
    /// <summary>Top khóa học theo số enrollment (toàn thời gian, mọi accessType/status).</summary>
    Task<List<TopCourseDto>> GetTopCoursesAsync(int limit);

    /// <summary>Top creator theo số học viên distinct trong tất cả khóa học của họ.</summary>
    Task<List<TopCreatorDto>> GetTopCreatorsAsync(int limit);
}