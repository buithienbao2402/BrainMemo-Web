using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebHoTroHocTap.API.DTOs.Common;
using WebHoTroHocTap.Business.DTOs.Invitation;
using WebHoTroHocTap.Business.Services;

namespace WebHoTroHocTap.API.Controllers;

[ApiController]
[Authorize]
public class InvitationController : ControllerBase
{
    private readonly IInvitationService _invitationService;
    public InvitationController(IInvitationService invitationService) => _invitationService = invitationService;

    [HttpPost("api/courses/{courseId:int}/invitations")]
    public async Task<IActionResult> Create(int courseId, [FromBody] InviteRequestDto dto)
    {
        try
        {
            int invitationId = await _invitationService.CreateInvitationAsync(courseId, CurrentUserId(), dto.EmailOrUsername);
            return Ok(new ApiResponse<object> { Success = true, Message = "Đã gửi lời mời", Data = new { invitationId } });
        }
        catch (Exception ex) { return MapError(ex); }
    }

    [HttpGet("api/courses/{courseId:int}/invitations")]
    public async Task<IActionResult> GetByCourse(int courseId)
    {
        try
        {
            var result = await _invitationService.GetCourseInvitationsAsync(courseId, CurrentUserId());
            return Ok(new ApiResponse<object> { Success = true, Message = "Lấy danh sách lời mời thành công", Data = result });
        }
        catch (Exception ex) { return MapError(ex); }
    }

    [HttpDelete("api/courses/{courseId:int}/invitations/{invitationId:int}")]
    public async Task<IActionResult> Revoke(int courseId, int invitationId)
    {
        try
        {
            bool ok = await _invitationService.RevokeInvitationAsync(courseId, invitationId, CurrentUserId());
            if (!ok) return NotFound(new ApiResponse<object> { Success = false, Message = "Không tìm thấy lời mời" });
            return Ok(new ApiResponse<object> { Success = true, Message = "Đã thu hồi lời mời" });
        }
        catch (Exception ex) { return MapError(ex); }
    }

    [HttpPost("api/invitations/{invitationId:int}/respond")]
    public async Task<IActionResult> Respond(int invitationId, [FromBody] InvitationRespondDto dto)
    {
        try
        {
            var result = await _invitationService.RespondAsync(invitationId, CurrentUserId(), dto.Accept);
            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = dto.Accept ? "Bạn đã tham gia khóa học" : "Bạn đã từ chối lời mời",
                Data = result
            });
        }
        catch (Exception ex) { return MapError(ex); }
    }

    private int CurrentUserId() => int.Parse(User.FindFirst("userId")!.Value);

    private IActionResult MapError(Exception ex) => ex switch
    {
        KeyNotFoundException => NotFound(new ApiResponse<object> { Success = false, Message = ex.Message }),
        UnauthorizedAccessException => StatusCode(403, new ApiResponse<object> { Success = false, Message = ex.Message }),
        InvalidOperationException => Conflict(new ApiResponse<object> { Success = false, Message = ex.Message }),
        ArgumentException => BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message }),
        _ => StatusCode(500, new ApiResponse<object> { Success = false, Message = "Lỗi máy chủ, vui lòng thử lại." })
    };
}