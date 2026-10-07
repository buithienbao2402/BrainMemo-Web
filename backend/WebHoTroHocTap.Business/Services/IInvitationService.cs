namespace WebHoTroHocTap.Business.Services;

public interface IInvitationService
{
    Task<int> CreateInvitationAsync(int courseId, int currentUserId, string emailOrUsername);
    Task<object> GetCourseInvitationsAsync(int courseId, int currentUserId);
    Task<bool> RevokeInvitationAsync(int courseId, int invitationId, int currentUserId);
    Task<object> RespondAsync(int invitationId, int currentUserId, bool accept);
}