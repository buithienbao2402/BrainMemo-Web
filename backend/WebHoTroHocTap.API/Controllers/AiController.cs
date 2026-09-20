using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebHoTroHocTap.API.DTOs.Common;
using WebHoTroHocTap.Business.DTOs.Ai;
using WebHoTroHocTap.Business.Exceptions;
using WebHoTroHocTap.Business.Services;

namespace WebHoTroHocTap.API.Controllers;

[ApiController]
[Route("api/ai")]
[AllowAnonymous] // Tính năng tốn hạn ngạch token -> bắt buộc đăng nhập
public class AiController : ControllerBase
{
    private readonly IAiService _aiService;
    private readonly ILogger<AiController> _logger;

    public AiController(IAiService aiService, ILogger<AiController> logger)
    {
        _aiService = aiService;
        _logger = logger;
    }

    [HttpPost("generate-flashcards")]
    public Task<IActionResult> GenerateFlashcards([FromBody] AiGenerateRequestDto dto) =>
        Run(() => _aiService.GenerateFlashcardsAsync(dto, HttpContext.RequestAborted), "Sinh flashcard thành công");

    [HttpPost("generate-quiz")]
    public Task<IActionResult> GenerateQuiz([FromBody] AiGenerateRequestDto dto) =>
        Run(() => _aiService.GenerateQuizAsync(dto, HttpContext.RequestAborted), "Sinh câu hỏi trắc nghiệm thành công");

    private async Task<IActionResult> Run<T>(Func<Task<T>> action, string successMessage)
    {
        try
        {
            var data = await action();
            return Ok(new ApiResponse<object> { Success = true, Message = successMessage, Data = data });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
        }
        catch (AiServiceException ex)
        {
            return StatusCode(ex.StatusCode, new ApiResponse<object> { Success = false, Message = ex.Message });
        }
        catch (OperationCanceledException)
        {
            // Client hủy request -> không cần trả body
            return StatusCode(499);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi không mong đợi khi sinh nội dung AI");
            return StatusCode(500, new ApiResponse<object> { Success = false, Message = "Lỗi máy chủ khi sinh nội dung AI." });
        }
    }
}