namespace WebHoTroHocTap.Business.Services;

public interface ICommentService
{
    Task<object> GetCommentsAsync(int courseId, int page, int pageSize);
    Task<object> CreateCommentAsync(int courseId, int userId, string content);
    Task<bool> UpdateCommentAsync(int commentId, int userId, string content);
    Task<bool> DeleteCommentAsync(int commentId, int userId);
}