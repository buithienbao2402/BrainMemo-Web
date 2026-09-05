using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebHoTroHocTap.API.DTOs.Common;
using WebHoTroHocTap.Business.DTOs.Page;
using WebHoTroHocTap.Business.Services;

namespace WebHoTroHocTap.API.Controllers;

[ApiController]
public class PageController : ControllerBase
{
    private readonly IPageService _pageService;

    public PageController(IPageService pageService)
    {
        _pageService = pageService;
    }

    [HttpPost("api/chapters/{chapterId}/pages")]
    [Authorize]
    public async Task<IActionResult> CreatePage(int chapterId, [FromBody] PageRequestDto dto)
    {
        try
        {
            int userId = int.Parse(User.FindFirst("userId")!.Value);
            int pageId = await _pageService.CreatePageAsync(chapterId, userId, dto);
            return Ok(new ApiResponse<object> { Success = true, Message = "Tạo trang thành công", Data = new { pageId } });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
        }
    }

    [HttpGet("api/chapters/{chapterId}/pages")]
    public async Task<IActionResult> GetPagesByChapter(int chapterId)
    {
        var pages = await _pageService.GetPagesByChapterAsync(chapterId);
        return Ok(new ApiResponse<object> { Success = true, Message = "Lấy danh sách trang thành công", Data = pages });
    }

    [HttpGet("api/pages/{id}")]
    public async Task<IActionResult> GetPageDetail(int id)
    {
        var detail = await _pageService.GetPageDetailAsync(id);
        if (detail == null) return NotFound(new ApiResponse<object> { Success = false, Message = "Không tìm thấy trang" });

        return Ok(new ApiResponse<object> { Success = true, Message = "Lấy nội dung trang thành công", Data = detail });
    }

    [HttpPut("api/pages/{id}")]
    [Authorize]
    public async Task<IActionResult> UpdatePage(int id, [FromBody] PageRequestDto dto)
    {
        try
        {
            int userId = int.Parse(User.FindFirst("userId")!.Value);
            bool ok = await _pageService.UpdatePageAsync(id, userId, dto);
            if (!ok) return NotFound(new ApiResponse<object> { Success = false, Message = "Không tìm thấy trang" });

            return Ok(new ApiResponse<object> { Success = true, Message = "Cập nhật trang thành công" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new ApiResponse<object> { Success = false, Message = ex.Message });
        }
    }

    [HttpDelete("api/pages/{id}")]
    [Authorize]
    public async Task<IActionResult> DeletePage(int id)
    {
        try
        {
            int userId = int.Parse(User.FindFirst("userId")!.Value);
            bool ok = await _pageService.DeletePageAsync(id, userId);
            if (!ok) return NotFound(new ApiResponse<object> { Success = false, Message = "Không tìm thấy trang" });

            return Ok(new ApiResponse<object> { Success = true, Message = "Xóa trang thành công" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new ApiResponse<object> { Success = false, Message = ex.Message });
        }
    }
}