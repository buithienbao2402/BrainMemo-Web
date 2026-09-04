namespace WebHoTroHocTap.API.DTOs.Media;

public class PresignedUrlRequestDto
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public string MediaType { get; set; } = "IMAGE"; // IMAGE, AUDIO, VIDEO
}

public class PresignedUrlResponseDto
{
    public string UploadUrl { get; set; } = string.Empty;
    public string ObjectKey { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}