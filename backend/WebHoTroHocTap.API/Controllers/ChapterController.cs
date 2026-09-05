using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebHoTroHocTap.API.DTOs.Common;
using WebHoTroHocTap.Business.DTOs.Chapter;
using WebHoTroHocTap.Business.Services;

namespace WebHoTroHocTap.API.Controllers;

[ApiController]
public class ChapterController : ControllerBase
{
    private readonly IChapterService _chapterService;

    public ChapterController(IChapterService chapterService)
    {
        _chapterService = chapterService;
    }

    // Lấy danh sách chương: ?isDraft=false (đã đăng), ?isDraft=true (nháp)
    [HttpGet("api/courses/{courseId}/chapters")]
    public async Task<IActionResult> GetChapters(int courseId, [FromQuery] bool isDraft = false)
    {
        try
        {
            int? userId = GetCurrentUserId();
            var result = await _chapterService.GetChaptersAsync(courseId, userId, isDraft);
            return Ok(new ApiResponse<object> { Success = true, Message = "Lấy danh sách chương thành công", Data = result });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new ApiResponse<object> { Success = false, Message = ex.Message });
        }
    }

    [HttpGet("api/chapters/{id}")]
    public async Task<IActionResult> GetChapterById(int id, [FromHeader(Name = "X-Access-Passcode")] string? passcode)
    {
        try
        {
            int? userId = GetCurrentUserId();
            var result = await _chapterService.GetChapterByIdAsync(id, userId, passcode);
            if (result == null) return NotFound(new ApiResponse<object> { Success = false, Message = "Không tìm thấy chương" });

            return Ok(new ApiResponse<object> { Success = true, Message = "Lấy chi tiết chương thành công", Data = result });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new ApiResponse<object> { Success = false, Message = ex.Message });
        }
    }

    // Tạo chương (Đăng ngay: isDraft=false, Lưu nháp: isDraft=true)
    [HttpPost("api/courses/{courseId}/chapters")]
    [Authorize]
    public async Task<IActionResult> CreateChapter(int courseId, [FromBody] ChapterRequestDto dto)
    {
        try
        {
            int userId = GetCurrentUserId()!.Value;
            int chapterId = await _chapterService.CreateChapterAsync(courseId, userId, dto);
            return Ok(new ApiResponse<object> { Success = true, Message = dto.IsDraft ? "Lưu chương nháp thành công" : "Đăng chương thành công", Data = new { chapterId } });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
        }
    }

    [HttpPut("api/chapters/{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateChapter(int id, [FromBody] ChapterRequestDto dto)
    {
        try
        {
            int userId = GetCurrentUserId()!.Value;
            bool ok = await _chapterService.UpdateChapterAsync(id, userId, dto);
            if (!ok) return NotFound(new ApiResponse<object> { Success = false, Message = "Không tìm thấy chương" });

            return Ok(new ApiResponse<object> { Success = true, Message = "Cập nhật chương thành công" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new ApiResponse<object> { Success = false, Message = ex.Message });
        }
    }

    [HttpDelete("api/chapters/{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteChapter(int id)
    {
        try
        {
            int userId = GetCurrentUserId()!.Value;
            bool ok = await _chapterService.DeleteChapterAsync(id, userId);
            if (!ok) return NotFound(new ApiResponse<object> { Success = false, Message = "Không tìm thấy chương" });

            return Ok(new ApiResponse<object> { Success = true, Message = "Xóa chương thành công" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new ApiResponse<object> { Success = false, Message = ex.Message });
        }
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst("userId");
        return claim != null ? int.Parse(claim.Value) : null;
    }
}