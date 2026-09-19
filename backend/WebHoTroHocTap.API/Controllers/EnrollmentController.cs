using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebHoTroHocTap.API.DTOs.Common;
using WebHoTroHocTap.Business.Services;

namespace WebHoTroHocTap.API.Controllers;

[ApiController]
public class EnrollmentController : ControllerBase
{
    private readonly IEnrollmentService _enrollmentService;
    public EnrollmentController(IEnrollmentService enrollmentService) => _enrollmentService = enrollmentService;

    public class EnrollRequestDto
    {
        public string? Passcode { get; set; }
    }

    [HttpPost("api/courses/{id}/enroll")]
    [Authorize]
    public async Task<IActionResult> Enroll(int id, [FromBody] EnrollRequestDto? dto)
    {
        int userId = int.Parse(User.FindFirst("userId")!.Value);
        try
        {
            int enrollmentId = await _enrollmentService.EnrollAsync(id, userId, dto?.Passcode);
            return Ok(new ApiResponse<object> { Success = true, Message = "Ghi danh thành công", Data = new { enrollmentId } });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ApiResponse<object> { Success = false, Message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new ApiResponse<object> { Success = false, Message = "Sai hoặc thiếu passcode", Errors = new object[] { new { code = ex.Message } } });
        }
    }
}