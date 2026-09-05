using Microsoft.AspNetCore.Mvc;
using WebHoTroHocTap.API.DTOs.Common;
using WebHoTroHocTap.Business.DTOs.Home;
using WebHoTroHocTap.Business.Services;

namespace WebHoTroHocTap.API.Controllers;

[ApiController]
[Route("api/home")]
public class HomeController : ControllerBase
{
    private readonly IHomeService _homeService;

    public HomeController(IHomeService homeService)
    {
        _homeService = homeService;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        int? userId = GetCurrentUserId();
        var data = await _homeService.GetHomeDashboardAsync(userId);
        return Ok(new ApiResponse<HomeDashboardDto> { Success = true, Message = "Lấy dữ liệu trang chủ thành công", Data = data });
    }

    [HttpGet("tags")]
    public async Task<IActionResult> GetPopularTags([FromQuery] int limit = 15)
    {
        var tags = await _homeService.GetPopularTagsAsync(limit);
        return Ok(new ApiResponse<List<string>> { Success = true, Message = "Lấy danh sách tags thành công", Data = tags });
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst("userId");
        return claim != null ? int.Parse(claim.Value) : null;
    }
}