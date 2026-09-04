using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Minio;
using Minio.DataModel.Args;
using WebHoTroHocTap.API.DTOs.Common;
using WebHoTroHocTap.API.DTOs.Media;

namespace WebHoTroHocTap.API.Controllers;

[ApiController]
[Route("api/media")]
public class MediaController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly IMinioClient _minioClient;

    public MediaController(IConfiguration config)
    {
        _config = config;
        _minioClient = new MinioClient()
            .WithEndpoint(_config["Minio:Endpoint"])
            .WithCredentials(_config["Minio:AccessKey"], _config["Minio:SecretKey"])
            .WithSSL(_config.GetValue<bool>("Minio:WithSSL"))
            .Build();
    }

    [HttpPost("presigned-url")]
    [Authorize]
    public async Task<IActionResult> GetPresignedUrl([FromBody] PresignedUrlRequestDto request)
    {
        string bucket = _config["Minio:BucketName"] ?? "brainmemo-media";
        string objectKey = $"uploads/{request.MediaType.ToLower()}/{Guid.NewGuid()}_{request.FileName}";
        int expiryInSeconds = 600; // Link upload tồn tại trong 10 phút

        var args = new PresignedPutObjectArgs()
            .WithBucket(bucket)
            .WithObject(objectKey)
            .WithExpiry(expiryInSeconds);

        string uploadUrl = await _minioClient.PresignedPutObjectAsync(args);

        return Ok(new ApiResponse<PresignedUrlResponseDto>
        {
            Success = true,
            Message = "Lấy upload url thành công",
            Data = new PresignedUrlResponseDto
            {
                UploadUrl = uploadUrl,
                ObjectKey = objectKey,
                ExpiresAt = DateTime.UtcNow.AddSeconds(expiryInSeconds)
            }
        });
    }
}