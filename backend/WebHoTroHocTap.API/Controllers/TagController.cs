using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebHoTroHocTap.API.DTOs.Common;
using WebHoTroHocTap.DataAccess;

namespace WebHoTroHocTap.API.Controllers;

[ApiController]
[Route("api/tags")]
public class TagController : ControllerBase
{
    private readonly AppDbContext _context;
    public TagController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetTags()
    {
        var tags = await _context.Tags.OrderBy(t => t.TagName).Select(t => t.TagName).ToListAsync();
        return Ok(new ApiResponse<List<string>> { Success = true, Message = "Lấy danh sách tag thành công", Data = tags });
    }
}