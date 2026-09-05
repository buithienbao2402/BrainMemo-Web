using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebHoTroHocTap.API.DTOs.Common;
using WebHoTroHocTap.API.DTOs.Course;
using WebHoTroHocTap.Business.Exceptions;
using WebHoTroHocTap.Business.Services;

namespace WebHoTroHocTap.API.Controllers;

[ApiController]
[Route("api/courses")]
public class CourseController : ControllerBase
{
    private readonly ICourseService _courseService;

    public CourseController(ICourseService courseService)
    {
        _courseService = courseService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCourses(
        [FromQuery] string scope = "public",
        [FromQuery] string? search = null,
        [FromQuery] string? tag = null,
        [FromQuery] string? sort = "newest",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        int? userId = GetCurrentUserId();
        var result = await _courseService.GetCoursesAsync(scope, search, tag, sort, page, pageSize, userId);
        return Ok(new ApiResponse<object> { Success = true, Message = "Lấy danh sách khóa học thành công", Data = result });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCourseById(int id, [FromHeader(Name = "X-Access-Passcode")] string? passcode)
    {
        try
        {
            int? userId = GetCurrentUserId();
            var result = await _courseService.GetCourseByIdAsync(id, userId, passcode);
            if (result == null)
            {
                return NotFound(new ApiResponse<object> { Success = false, Message = "Không tìm thấy khóa học" });
            }
            return Ok(new ApiResponse<object> { Success = true, Message = "Lấy chi tiết khóa học thành công", Data = result });
        }
        catch (UnauthorizedAccessException ex)
        {
            if (ex.Message == "PASSCODE_INVALID")
            {
                return StatusCode(403, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Sai hoặc thiếu passcode truy cập nội dung bảo vệ"
                });
            }
            return StatusCode(403, new ApiResponse<object> { Success = false, Message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateCourse([FromBody] CourseRequestDto dto)
    {
        // #5: không dùng "!.Value" ép buộc nữa, kiểm tra tường minh
        int? userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new ApiResponse<object> { Success = false, Message = "Phiên đăng nhập không hợp lệ." });
        }

        try
        {
            int courseId = await _courseService.CreateCourseAsync(
                userId.Value,
                dto.Title,
                dto.Description,
                dto.CoverImageObjectKey,
                dto.AccessType,
                dto.Passcode,
                dto.Tags
            );

            return Ok(new ApiResponse<object> { Success = true, Message = "Tạo khóa học thành công", Data = new { courseId } });
        }
        catch (PasscodeRequiredException ex)
        {
            // TODO: đối chiếu lại đúng kiểu dữ liệu "Errors" trong ApiResponse<T> của bạn,
            // đổi lại phần khởi tạo bên dưới cho khớp nếu khác.
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = ex.Message,
                Errors = new object[] { new { field = "passcode", code = "PASSCODE_REQUIRED", message = ex.Message } }
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateCourse(int id, [FromBody] CourseRequestDto dto)
    {
        int? userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new ApiResponse<object> { Success = false, Message = "Phiên đăng nhập không hợp lệ." });
        }

        try
        {
            bool success = await _courseService.UpdateCourseAsync(
                id,
                userId.Value,
                dto.Title,
                dto.Description,
                dto.CoverImageObjectKey,
                dto.AccessType,
                dto.Passcode,
                dto.Status,
                dto.Tags
            );

            if (!success) return NotFound(new ApiResponse<object> { Success = false, Message = "Không tìm thấy khóa học" });

            return Ok(new ApiResponse<object> { Success = true, Message = "Cập nhật khóa học thành công" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new ApiResponse<object> { Success = false, Message = ex.Message });
        }
        catch (PasscodeRequiredException ex)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = ex.Message,
                Errors = new object[] { new { field = "passcode", code = "PASSCODE_REQUIRED", message = ex.Message } }
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteCourse(int id)
    {
        int? userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new ApiResponse<object> { Success = false, Message = "Phiên đăng nhập không hợp lệ." });
        }

        try
        {
            bool success = await _courseService.DeleteCourseAsync(id, userId.Value);
            if (!success) return NotFound(new ApiResponse<object> { Success = false, Message = "Không tìm thấy khóa học" });

            return Ok(new ApiResponse<object> { Success = true, Message = "Xóa khóa học thành công" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new ApiResponse<object> { Success = false, Message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
        }
    }

    private int? GetCurrentUserId()
    {
        // #5: TryParse thay vì Parse, không còn ném FormatException nếu claim sai định dạng
        var claim = User.FindFirst("userId");
        if (claim != null && int.TryParse(claim.Value, out int userId))
        {
            return userId;
        }
        return null;
    }
}