namespace WebHoTroHocTap.Business.Services;

public interface IEnrollmentService
{
    /// <summary>
    /// Tự ghi danh (hoặc idempotent nếu đã ghi danh rồi). Trả về enrollmentId.
    /// Ném UnauthorizedAccessException("PASSCODE_INVALID") nếu course PROTECTED và passcode sai.
    /// </summary>
    Task<int> EnrollAsync(int courseId, int userId, string? passcode);
}