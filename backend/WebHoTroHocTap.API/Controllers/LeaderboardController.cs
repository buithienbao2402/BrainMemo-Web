using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebHoTroHocTap.API.DTOs.Common;
using WebHoTroHocTap.Business.DTOs.Leaderboard;
using WebHoTroHocTap.Business.Services;

namespace WebHoTroHocTap.API.Controllers;

[ApiController]
[AllowAnonymous]
public class LeaderboardController : ControllerBase
{
    private readonly ILeaderboardService _leaderboardService;

    public LeaderboardController(ILeaderboardService leaderboardService)
    {
        _leaderboardService = leaderboardService;
    }

    [HttpGet("api/leaderboard/courses")]
    public async Task<IActionResult> GetTopCourses([FromQuery] int limit = 10)
    {
        try
        {
            var data = await _leaderboardService.GetTopCoursesAsync(limit);
            return Ok(new ApiResponse<List<TopCourseDto>>
            {
                Success = true,
                Message = "Lấy top khóa học thành công",
                Data = data
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<object> { Success = false, Message = ex.Message });
        }
    }

    [HttpGet("api/leaderboard/creators")]
    public async Task<IActionResult> GetTopCreators([FromQuery] int limit = 10)
    {
        try
        {
            var data = await _leaderboardService.GetTopCreatorsAsync(limit);
            return Ok(new ApiResponse<List<TopCreatorDto>>
            {
                Success = true,
                Message = "Lấy top creator thành công",
                Data = data
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<object> { Success = false, Message = ex.Message });
        }
    }
}