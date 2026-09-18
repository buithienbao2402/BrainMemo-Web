using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebHoTroHocTap.API.DTOs.Common;
using WebHoTroHocTap.Business.Services;

namespace WebHoTroHocTap.API.Controllers;

[ApiController]
[Route("api/learning")]
[Authorize]
public class LearningController : ControllerBase
{
    private readonly ILearningService _learningService;
    public LearningController(ILearningService learningService) => _learningService = learningService;

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        int userId = GetCurrentUserId()!.Value;
        var result = await _learningService.GetDashboardSummaryAsync(userId);
        return Ok(new ApiResponse<object> { Success = true, Message = "OK", Data = result });
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst("userId");
        return claim != null && int.TryParse(claim.Value, out int userId) ? userId : null;
    }
}