using WebHoTroHocTap.DataAccess.Enums;

namespace WebHoTroHocTap.Business.Services;

public interface ICourseService
{
    Task<int> CreateCourseAsync(int creatorId, string title, string? description, string? coverImageKey, AccessType accessType, string? passcode, List<string> tags);
    Task<bool> UpdateCourseAsync(int courseId, int creatorId, string title, string? description, string? coverImageKey, AccessType accessType, string? passcode, CourseStatus? status, List<string> tags);
    Task<bool> DeleteCourseAsync(int courseId, int creatorId);
    Task<object> GetCoursesAsync(string scope, string? search, string? tag, string? sort, int page, int pageSize, int? currentUserId);
    Task<object?> GetCourseByIdAsync(int courseId, int? currentUserId, string? passcodeHeader);
}