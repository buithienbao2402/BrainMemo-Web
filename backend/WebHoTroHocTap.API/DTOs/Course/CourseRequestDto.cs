namespace WebHoTroHocTap.API.DTOs.Course;

public class CourseRequestDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImageObjectKey { get; set; }
    public string AccessType { get; set; } = "PUBLIC"; // PUBLIC, PRIVATE, PROTECTED
    public string? Passcode { get; set; }
    public List<string> Tags { get; set; } = new();
}