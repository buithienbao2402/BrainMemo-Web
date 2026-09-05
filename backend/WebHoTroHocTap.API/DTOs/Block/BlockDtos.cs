namespace WebHoTroHocTap.API.DTOs.Block;

public class BlockRequestDto
{
    public string BlockType { get; set; } = "TEXT"; // TEXT, FLASHCARD, QUIZ
    public int OrderIndex { get; set; } = 1;

    // Dành cho BlockType = TEXT
    public string? ContentText { get; set; }

    // Dành cho BlockType = FLASHCARD
    public List<FlashcardItemDto>? Flashcards { get; set; }

    // Dành cho BlockType = QUIZ
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