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

    public CommentController(ICommentService commentService)
    {
        _commentService = commentService;
    }

    [HttpGet("api/courses/{courseId}/comments")]
    public async Task<IActionResult> GetComments(int courseId)
    {
        int? userId = GetCurrentUserId();
        var comments = await _commentService.GetCommentsByCourseAsync(courseId, userId);
        return Ok(new ApiResponse<List<CommentResponseDto>> { Success = true, Message = "Lấy danh sách bình luận thành công", Data = comments });
    }

    [HttpPost("api/courses/{courseId}/comments")]
    [Authorize]
    public async Task<IActionResult> CreateComment(int courseId, [FromBody] CreateCommentRequestDto dto)
    {
        try
        {
            int userId = GetCurrentUserId()!.Value;
            int commentId = await _commentService.CreateCommentAsync(courseId, userId, dto);
            return Ok(new ApiResponse<object> { Success = true, Message = "Đăng bình luận thành công", Data = new { commentId } });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
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
        return claim != null ? int.Parse(claim.Value) : null;
    }
}