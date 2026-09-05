namespace WebHoTroHocTap.Business.Exceptions;

public class PasscodeRequiredException : Exception
{
    public PasscodeRequiredException()
        : base("Khóa học ở chế độ Protected bắt buộc phải có passcode.")
    {
    }
}