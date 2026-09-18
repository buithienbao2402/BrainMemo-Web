using Microsoft.AspNetCore.Http;

namespace WebHoTroHocTap.API.DTOs.Media;

public class MediaUploadRequestDto
{
    public IFormFile File { get; set; } = null!;
    public string MediaType { get; set; } = "IMAGE"; // IMAGE, AUDIO, VIDEO
}

public class MediaUploadResponseDto
{
    public string Url { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string MediaType { get; set; } = string.Empty;
    public long FileSize { get; set; }
}