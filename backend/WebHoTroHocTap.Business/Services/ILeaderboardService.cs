using WebHoTroHocTap.Business.DTOs.Leaderboard;

namespace WebHoTroHocTap.Business.Services;

public interface ILeaderboardService
{
    Task<List<LeaderboardDto>> GetTopLearnersAsync(int limit);
}