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
        [FromQuery] List<string>? tags = null,
        [FromQuery] string? sort = "newest",
        [FromQuery] string? status = null,
        [FromQuery] string? accessType = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        int? userId = GetCurrentUserId();
        var result = await _courseService.GetCoursesAsync(scope, search, tags, sort, status, accessType, page, pageSize, userId);
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
            if (ex.Message == "PASSCODE_REQUIRED" || ex.Message == "PASSCODE_INVALID")
            {
                return PasscodeErrorResponse(ex.Message);
            }
            // PRIVATE hoặc các trường hợp 403 khác -> trả nguyên message nghiệp vụ
            return StatusCode(403, new ApiResponse<object> { Success = false, Message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateCourse([FromBody] CourseRequestDto dto)
    {
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

    // Trả cùng định dạng errors[] mà CreateCourse/UpdateCourse đã dùng cho PasscodeRequiredException,
    // để FE xử lý thống nhất 1 chỗ (usePasscodeAccess) cho mọi API có PROTECTED.
    private IActionResult PasscodeErrorResponse(string code)
    {
        string message = code == "PASSCODE_REQUIRED"
            ? "Nội dung này yêu cầu mật khẩu truy cập."
            : "Mật khẩu truy cập không đúng.";

        return StatusCode(403, new ApiResponse<object>
        {
            Success = false,
            Message = message,
            Errors = new object[] { new { field = "passcode", code, message } }
        });
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst("userId");
        if (claim != null && int.TryParse(claim.Value, out int userId))
        {
            return userId;
        }
        return null;
    }
}