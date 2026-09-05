using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebHoTroHocTap.API.DTOs.Common;
using WebHoTroHocTap.Business.DTOs.Block;
using WebHoTroHocTap.Business.Services;

namespace WebHoTroHocTap.API.Controllers;

[ApiController]
[Route("api/blocks")]
public class BlockController : ControllerBase
{
    private readonly IBlockService _blockService;

    public BlockController(IBlockService blockService)
    {
        _blockService = blockService;
    }

    [HttpPost("/api/pages/{pageId}/blocks")]
    [Authorize]
    public async Task<IActionResult> CreateBlock(int pageId, [FromBody] BlockRequestDto dto)
    {
        try
        {
            int userId = int.Parse(User.FindFirst("userId")!.Value);
            int blockId = await _blockService.CreateBlockAsync(pageId, userId, dto);
            return Ok(new ApiResponse<object> { Success = true, Message = "Tạo khối nội dung thành công", Data = new { blockId } });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateBlock(int id, [FromBody] BlockRequestDto dto)
    {
        try
        {
            int userId = int.Parse(User.FindFirst("userId")!.Value);
            bool ok = await _blockService.UpdateBlockAsync(id, userId, dto);
            if (!ok) return NotFound(new ApiResponse<object> { Success = false, Message = "Không tìm thấy block" });

            return Ok(new ApiResponse<object> { Success = true, Message = "Cập nhật block thành công" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new ApiResponse<object> { Success = false, Message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteBlock(int id)
    {
        try
        {
            int userId = int.Parse(User.FindFirst("userId")!.Value);
            bool ok = await _blockService.DeleteBlockAsync(id, userId);
            if (!ok) return NotFound(new ApiResponse<object> { Success = false, Message = "Không tìm thấy block" });

            return Ok(new ApiResponse<object> { Success = true, Message = "Xóa block thành công" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new ApiResponse<object> { Success = false, Message = ex.Message });
        }
    }
}