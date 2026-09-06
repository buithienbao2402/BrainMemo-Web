using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebHoTroHocTap.API.DTOs.Common;
using WebHoTroHocTap.Business.DTOs.Comment;
using WebHoTroHocTap.Business.Services;

namespace WebHoTroHocTap.API.Controllers;

[ApiController]
public class CommentController : ControllerBase
{
    private readonly ICommentService _commentService;
    public CommentController(ICommentService commentService) => _commentService = commentService;

    [HttpGet("api/courses/{courseId}/comments")]
    public async Task<IActionResult> GetComments(int courseId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _commentService.GetCommentsAsync(courseId, page, pageSize);
        return Ok(new ApiResponse<object> { Success = true, Message = "Lấy bình luận thành công", Data = result });
    }

    [HttpPost("api/courses/{courseId}/comments")]
    [Authorize]
    public async Task<IActionResult> CreateComment(int courseId, [FromBody] CommentRequestDto dto)
    {
        int userId = GetCurrentUserId()!.Value;
        var result = await _commentService.CreateCommentAsync(courseId, userId, dto.Content);
        return Ok(new ApiResponse<object> { Success = true, Message = "Bình luận thành công", Data = result });
    }

    [HttpPut("api/comments/{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateComment(int id, [FromBody] CommentRequestDto dto)
    {
        try
        {
            int userId = GetCurrentUserId()!.Value;
            bool ok = await _commentService.UpdateCommentAsync(id, userId, dto.Content);
            if (!ok) return NotFound(new ApiResponse<object> { Success = false, Message = "Không tìm thấy bình luận" });
            return Ok(new ApiResponse<object> { Success = true, Message = "Cập nhật bình luận thành công" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new ApiResponse<object> { Success = false, Message = ex.Message });
        }
    }

    [HttpDelete("api/comments/{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteComment(int id)
    {
        try
        {
            int userId = GetCurrentUserId()!.Value;
            bool ok = await _commentService.DeleteCommentAsync(id, userId);
            if (!ok) return NotFound(new ApiResponse<object> { Success = false, Message = "Không tìm thấy bình luận" });
            return Ok(new ApiResponse<object> { Success = true, Message = "Xóa bình luận thành công" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new ApiResponse<object> { Success = false, Message = ex.Message });
        }
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst("userId");
        return claim != null && int.TryParse(claim.Value, out int userId) ? userId : null;
    }
}