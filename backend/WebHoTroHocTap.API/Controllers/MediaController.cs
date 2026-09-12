using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebHoTroHocTap.API.DTOs.Common;
using WebHoTroHocTap.API.DTOs.Media;

namespace WebHoTroHocTap.API.Controllers;

[ApiController]
[Route("api/media")]
public class MediaController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    private static readonly Dictionary<string, string[]> AllowedExtensions = new()
    {
        { "IMAGE", new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" } },
        { "AUDIO", new[] { ".mp3", ".wav", ".ogg", ".m4a" } },
        { "VIDEO", new[] { ".mp4", ".webm", ".mov", ".mkv" } }
    };

    public MediaController(IWebHostEnvironment env)
    {
        _env = env;
    }

    [HttpPost("upload")]
    [Authorize]
    [RequestSizeLimit(100 * 1024 * 1024)] // 100MB
    public async Task<IActionResult> UploadMedia([FromForm] MediaUploadRequestDto request)
    {
        try
        {
            var file = request.File;
            if (file == null || file.Length == 0)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Vui lòng chọn tệp tin để tải lên."
                });
            }

            var type = (request.MediaType ?? "IMAGE").ToUpper();
            if (!AllowedExtensions.ContainsKey(type))
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Loại media không hợp lệ. Chỉ chấp nhận IMAGE, AUDIO, VIDEO."
                });
            }

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions[type].Contains(ext))
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = $"Định dạng tệp {ext} không được hỗ trợ cho loại {type}."
                });
            }

            string subFolder = type switch
            {
                "IMAGE" => "images",
                "AUDIO" => "audios",
                "VIDEO" => "videos",
                _ => "others"
            };

            string uploadsFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", subFolder);
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            string uniqueFileName = $"{Guid.NewGuid():N}_{Path.GetFileName(file.FileName)}";
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            string relativeUrl = $"/uploads/{subFolder}/{uniqueFileName}";
            string fullUrl = $"{Request.Scheme}://{Request.Host}{relativeUrl}";

            return Ok(new ApiResponse<MediaUploadResponseDto>
            {
                Success = true,
                Message = "Tải lên media thành công.",
                Data = new MediaUploadResponseDto
                {
                    Url = fullUrl,
                    FileName = file.FileName,
                    MediaType = type,
                    FileSize = file.Length
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = $"Lỗi máy chủ: {ex.Message}"
            });
        }
    }
}