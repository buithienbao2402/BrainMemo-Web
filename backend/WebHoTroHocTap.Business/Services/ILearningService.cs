namespace WebHoTroHocTap.Business.Services;

public interface ILearningService
{
    Task<object> GetDashboardSummaryAsync(int userId);
}