namespace WebHoTroHocTap.Business.Exceptions;

public class AiServiceException : Exception
{
    public int StatusCode { get; }

    public AiServiceException(string message, int statusCode = 500) : base(message)
    {
        StatusCode = statusCode;
    }
}