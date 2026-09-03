using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebHoTroHocTap.API.DTOs.Common;
using WebHoTroHocTap.API.DTOs.Course;
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
        int? userId = User.FindFirst("userId") != null ? int.Parse(User.FindFirst("userId")!.Value) : null;
        var result = await _courseService.GetCoursesAsync(scope, search, tag, sort, page, pageSize, userId);
        return Ok(new ApiResponse<object> { Success = true, Message = "Lấy danh sách khóa học thành công", Data = result });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCourseById(int id, [FromHeader(Name = "X-Access-Passcode")] string? passcode)
    {
        try
        {
            int? userId = User.FindFirst("userId") != null ? int.Parse(User.FindFirst("userId")!.Value) : null;
            var result = await _courseService.GetCourseByIdAsync(id, userId, passcode);
            if (result == null)
            {
                return NotFound(new ApiResponse<object> { Success = false, Message = "Không tìm thấy khóa học" });
            }
            return Ok(new ApiResponse<object> { Success = true, Message = "Lấy chi tiết khóa học thành công", Data = result });
        }
        catch (UnauthorizedAccessException ex)
        {
            if (ex.Message == "PASSCODE_REQUIRED_OR_INVALID")
            {
                return StatusCode(403, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Thiếu hoặc sai Passcode bảo vệ khóa học"
                });
            }
            return StatusCode(403, new ApiResponse<object> { Success = false, Message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateCourse([FromBody] CourseRequestDto dto)
    {
        try
        {
            int userId = int.Parse(User.FindFirst("userId")!.Value);
            int courseId = await _courseService.CreateCourseAsync(
                userId,
                dto.Title,
                dto.Description,
                dto.CoverImageObjectKey,
                dto.AccessType,
                dto.Passcode,
                dto.Tags
            );

            return Ok(new ApiResponse<object> { Success = true, Message = "Tạo khóa học thành công", Data = new { courseId } });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
        }
    }
}