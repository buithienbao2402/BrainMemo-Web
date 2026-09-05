using WebHoTroHocTap.API.DTOs.Page;

namespace WebHoTroHocTap.Business.Services;

public interface IPageService
{
    Task<int> CreatePageAsync(int chapterId, int userId, PageRequestDto dto);
    Task<object> GetPagesByChapterAsync(int chapterId);
    Task<object?> GetPageDetailAsync(int pageId);
    Task<bool> UpdatePageAsync(int pageId, int userId, PageRequestDto dto);
    Task<bool> DeletePageAsync(int pageId, int userId);
}