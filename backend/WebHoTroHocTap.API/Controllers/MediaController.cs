using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebHoTroHocTap.API.DTOs.Common;
using WebHoTroHocTap.API.DTOs.Media;

namespace WebHoTroHocTap.API.Controllers;

[ApiController]
[Route("api/media")]
public class MediaController : ControllerBase
{
    private const long MB = 1024 * 1024;

    private sealed record MediaRule(string[] Extensions, string Folder, long MaxBytes);

    private static readonly Dictionary<string, MediaRule> Rules = new()
    {
        ["IMAGE"] = new(new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" }, "images", 5 * MB),
        ["AUDIO"] = new(new[] { ".mp3", ".wav", ".ogg", ".m4a" }, "audios", 20 * MB),
        ["VIDEO"] = new(new[] { ".mp4", ".webm", ".mov", ".mkv" }, "videos", 100 * MB),
    };

    private readonly IWebHostEnvironment _env;
    private readonly ILogger<MediaController> _logger;

    public MediaController(IWebHostEnvironment env, ILogger<MediaController> logger)
    {
        _env = env;
        _logger = logger;
    }

    [HttpPost("upload")]
    [Authorize]
    [RequestSizeLimit(100 * MB)]
    [RequestFormLimits(MultipartBodyLengthLimit = 100 * MB)]
    public async Task<IActionResult> UploadMedia([FromForm] MediaUploadRequestDto request, CancellationToken ct)
    {
        try
        {
            var file = request.File;
            if (file == null || file.Length == 0)
                return BadRequest(Fail("Vui lòng chọn tệp tin để tải lên."));

            var type = (request.MediaType ?? "IMAGE").Trim().ToUpperInvariant();
            if (!Rules.TryGetValue(type, out var rule))
                return BadRequest(Fail("Loại media không hợp lệ. Chỉ chấp nhận IMAGE, AUDIO, VIDEO."));

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!rule.Extensions.Contains(ext))
                return BadRequest(Fail($"Định dạng tệp {ext} không được hỗ trợ cho loại {type}."));

            if (file.Length > rule.MaxBytes)
                return BadRequest(Fail($"Tệp {type} tối đa {rule.MaxBytes / MB}MB."));

            var folderPath = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", rule.Folder);
            Directory.CreateDirectory(folderPath);

            // Không dùng tên gốc: tránh ký tự lạ/dấu tiếng Việt làm hỏng URL và vượt 500 ký tự của cột DB
            var storedName = $"{Guid.NewGuid():N}{ext}";
            var filePath = Path.Combine(folderPath, storedName);

            await using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream, ct);
            }

            var objectKey = $"/uploads/{rule.Folder}/{storedName}";
            var fullUrl = $"{Request.Scheme}://{Request.Host}{objectKey}";

            return Ok(new ApiResponse<MediaUploadResponseDto>
            {
                Success = true,
                Message = "Tải lên media thành công.",
                Data = new MediaUploadResponseDto
                {
                    Url = fullUrl,
                    ObjectKey = objectKey,
                    FileName = file.FileName,
                    MediaType = type,
                    FileSize = file.Length
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Upload media thất bại");
            return StatusCode(500, Fail("Lỗi máy chủ khi lưu tệp. Vui lòng thử lại."));
        }
    }

    private static ApiResponse<object> Fail(string message) => new() { Success = false, Message = message };
}