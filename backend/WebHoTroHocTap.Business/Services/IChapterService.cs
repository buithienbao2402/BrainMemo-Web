using WebHoTroHocTap.Business.DTOs.Chapter;

namespace WebHoTroHocTap.Business.Services;

public interface IChapterService
{
    Task<int> CreateChapterAsync(int courseId, int userId, ChapterRequestDto dto);
    Task<object> GetChaptersAsync(int courseId, int? currentUserId, bool isDraft);
    Task<object?> GetChapterByIdAsync(int chapterId, int? currentUserId, string? passcodeHeader);
    Task<bool> UpdateChapterAsync(int chapterId, int userId, ChapterRequestDto dto);
    Task<bool> DeleteChapterAsync(int chapterId, int userId);
}