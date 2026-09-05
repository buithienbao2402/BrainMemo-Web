namespace WebHoTroHocTap.API.DTOs.Chapter;

public class ChapterRequestDto
{
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; } = 1;
    public string AccessType { get; set; } = "PUBLIC"; // PUBLIC, PRIVATE, PROTECTED
    public string? Passcode { get; set; }
    public bool IsDraft { get; set; } = false; // true = Lưu nháp, false = Đăng ngay
}