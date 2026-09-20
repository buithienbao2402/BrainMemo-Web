using System.ComponentModel.DataAnnotations;

namespace WebHoTroHocTap.Business.DTOs.Ai;

public class AiGenerateRequestDto
{
    [Required(ErrorMessage = "Nội dung tài liệu/bài học không được để trống")]
    public string ContentText { get; set; } = string.Empty;

    public int Count { get; set; } = 5;

    public string? Difficulty { get; set; }
}