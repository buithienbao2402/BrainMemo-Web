namespace WebHoTroHocTap.Business.DTOs.Ai;

public class AiFlashcardItemDto
{
    public string FrontText { get; set; } = string.Empty;
    public string BackText { get; set; } = string.Empty;
}

public class AiQuizOptionDto
{
    public string OptionText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}

public class AiQuizItemDto
{
    public string QuestionText { get; set; } = string.Empty;
    public string? Explanation { get; set; }
    public List<AiQuizOptionDto> Options { get; set; } = new();
}