// backend/WebHoTroHocTap.Business/Security/PasscodeGuard.cs
namespace WebHoTroHocTap.Business.Security;

/// <summary>
/// Dùng chung cho Course/Chapter/Page khi accessType = PROTECTED.
/// Ném UnauthorizedAccessException với 2 message riêng biệt để Controller
/// phân biệt và trả đúng error code theo API_Contract.md mục 0:
/// - "PASSCODE_REQUIRED": thiếu header X-Access-Passcode
/// - "PASSCODE_INVALID": có header nhưng sai, hoặc tài nguyên chưa có passcode hash
/// </summary>
public static class PasscodeGuard
{
    public static void Verify(string? passcodeHeader, string? passcodeHash)
    {
        if (string.IsNullOrEmpty(passcodeHeader))
        {
            throw new UnauthorizedAccessException("PASSCODE_REQUIRED");
        }

        if (string.IsNullOrEmpty(passcodeHash) || !BCrypt.Net.BCrypt.Verify(passcodeHeader, passcodeHash))
        {
            throw new UnauthorizedAccessException("PASSCODE_INVALID");
        }
    }
}