namespace WebHoTroHocTap.Business.Services;

public interface ICourseService
{
    Task<int> CreateCourseAsync(int creatorId, string title, string? description, string? coverImageKey, string accessType, string? passcode, List<string> tags);
    Task<object> GetCoursesAsync(string scope, string? search, string? tag, string? sort, int page, int pageSize, int? currentUserId);
    Task<object?> GetCourseByIdAsync(int courseId, int? currentUserId, string? passcodeHeader);
}