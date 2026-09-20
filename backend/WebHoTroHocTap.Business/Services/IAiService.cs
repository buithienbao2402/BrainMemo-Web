using WebHoTroHocTap.Business.DTOs.Ai;

namespace WebHoTroHocTap.Business.Services;

public interface IAiService
{
    Task<List<AiFlashcardItemDto>> GenerateFlashcardsAsync(AiGenerateRequestDto dto, CancellationToken ct = default);
    Task<List<AiQuizItemDto>> GenerateQuizAsync(AiGenerateRequestDto dto, CancellationToken ct = default);
}