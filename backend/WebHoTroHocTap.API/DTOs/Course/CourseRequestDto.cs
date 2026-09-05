using WebHoTroHocTap.DataAccess.Enums;

namespace WebHoTroHocTap.API.DTOs.Course;

public class CourseRequestDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImageObjectKey { get; set; }
    public AccessType AccessType { get; set; } = AccessType.PUBLIC;
    public string? Passcode { get; set; }

    /// <summary>
    /// #8: chỉ có ý nghĩa khi Update. Khi Create luôn bị bỏ qua (course mới luôn khởi tạo UPDATING).
    /// Để null nếu FE không muốn đổi status hiện tại.
    /// </summary>
    public CourseStatus? Status { get; set; }

    public List<string> Tags { get; set; } = new();
}