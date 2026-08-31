// WebHoTroHocTap.API/DTOs/Common/ApiResponse.cs
namespace WebHoTroHocTap.API.DTOs.Common
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; } = true;
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public object? Errors { get; set; }
    }
}