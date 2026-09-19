namespace WebHoTroHocTap.Business.DTOs.Progress;

public class QuizAnswerDto
{
    public int QuestionId { get; set; }
    public int SelectedOptionId { get; set; }
}

public class QuizSubmitRequestDto
{
    public List<QuizAnswerDto> Answers { get; set; } = new();
}