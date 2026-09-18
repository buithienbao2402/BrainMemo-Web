namespace WebHoTroHocTap.Business.DTOs.Block;

public class BlockRequestDto
{
    public string BlockType { get; set; } = "TEXT";
    public int OrderIndex { get; set; } = 1;

    // Dùng làm nội dung văn bản (TEXT) hoặc chú thích/caption (IMAGE, AUDIO, VIDEO)
    public string? ContentText { get; set; }

    // Đường dẫn tệp media cục bộ (vd: /uploads/images/abc.png hoặc http://...)
    public string? MediaUrl { get; set; }

    public List<FlashcardItemDto>? Flashcards { get; set; }
    public List<QuizQuestionDto>? Questions { get; set; }
}

public class FlashcardItemDto
{
    public string FrontText { get; set; } = string.Empty;
    public string BackText { get; set; } = string.Empty;
    public int OrderIndex { get; set; } = 1;
}

public class QuizQuestionDto
{
    public string QuestionText { get; set; } = string.Empty;
    public string? Explanation { get; set; }
    public int OrderIndex { get; set; } = 1;
    public List<QuizOptionDto> Options { get; set; } = new();
}

public class QuizOptionDto
{
    public string OptionText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; } = false;
}