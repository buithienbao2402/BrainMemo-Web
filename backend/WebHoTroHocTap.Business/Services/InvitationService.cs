using Microsoft.EntityFrameworkCore;
using WebHoTroHocTap.DataAccess;
using WebHoTroHocTap.DataAccess.Entities;

namespace WebHoTroHocTap.Business.Services;

public class InvitationService : IInvitationService
{
    private const string Pending = "PENDING";
    private const string Accepted = "ACCEPTED";
    private const string Declined = "DECLINED";
    private const string InvitationEntity = "course_invitation";
    private const string CourseEntity = "course";

    private readonly AppDbContext _context;
    private readonly INotificationService _notificationService;

    public InvitationService(AppDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<int> CreateInvitationAsync(int courseId, int currentUserId, string emailOrUsername)
    {
        var key = emailOrUsername?.Trim();
        if (string.IsNullOrWhiteSpace(key))
            throw new ArgumentException("Vui lòng nhập email học viên.");

        var course = await _context.Courses.Include(c => c.Creator)
            .FirstOrDefaultAsync(c => c.CourseId == courseId);
        if (course == null) throw new KeyNotFoundException("Khóa học không tồn tại.");
        if (course.CreatorId != currentUserId)
            throw new UnauthorizedAccessException("Chỉ người tạo khóa học mới có quyền mời học viên.");

        // Hiện chỉ có email (bảng user chưa có username)
        var invitee = await _context.Users.FirstOrDefaultAsync(u => u.Email == key);
        if (invitee == null || invitee.IsActive == false)
            throw new KeyNotFoundException("Không tìm thấy người dùng với email này.");
        if (invitee.UserId == currentUserId)
            throw new ArgumentException("Bạn là người tạo khóa học, không thể tự mời chính mình.");

        bool alreadyEnrolled = await _context.Enrollments
            .AnyAsync(e => e.CourseId == courseId && e.UserId == invitee.UserId);
        if (alreadyEnrolled)
            throw new InvalidOperationException("Học viên này đã tham gia khóa học.");

        bool hasPending = await _context.CourseInvitations
            .AnyAsync(i => i.CourseId == courseId && i.InviteeUserId == invitee.UserId && i.Status == Pending);
        if (hasPending)
            throw new InvalidOperationException("Đã có lời mời đang chờ phản hồi cho học viên này.");

        await using var tx = await _context.Database.BeginTransactionAsync();

        var invitation = new CourseInvitation
        {
            CourseId = courseId,
            InviterId = currentUserId,
            InviteeEmail = invitee.Email,
            InviteeUserId = invitee.UserId,
            Status = Pending,
            CreatedAt = DateTime.UtcNow
        };
        _context.CourseInvitations.Add(invitation);
        await _context.SaveChangesAsync();

        await _notificationService.CreateNotificationAsync(
            invitee.UserId,
            "COURSE_INVITATION",
            $"Giảng viên {course.Creator.FullName} đã mời bạn tham gia khóa học {course.Title}",
            InvitationEntity,
            invitation.InvitationId);

        await tx.CommitAsync();
        return invitation.InvitationId;
    }

    public async Task<object> GetCourseInvitationsAsync(int courseId, int currentUserId)
    {
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == courseId);
        if (course == null) throw new KeyNotFoundException("Khóa học không tồn tại.");
        if (course.CreatorId != currentUserId)
            throw new UnauthorizedAccessException("Chỉ người tạo khóa học mới xem được danh sách lời mời.");

        return await _context.CourseInvitations
            .Where(i => i.CourseId == courseId)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new
            {
                invitationId = i.InvitationId,
                courseId = i.CourseId,
                inviterId = i.InviterId,
                inviteeEmail = i.InviteeEmail,
                inviteeUserId = i.InviteeUserId,
                inviteeFullName = i.InviteeUser != null ? i.InviteeUser.FullName : null,
                inviteeAvatarUrl = i.InviteeUser != null ? i.InviteeUser.AvatarUrl : null,
                status = i.Status,
                createdAt = i.CreatedAt,
                respondedAt = i.RespondedAt
            })
            .ToListAsync();
    }

    public async Task<bool> RevokeInvitationAsync(int courseId, int invitationId, int currentUserId)
    {
        var invitation = await _context.CourseInvitations
            .Include(i => i.Course)
            .FirstOrDefaultAsync(i => i.InvitationId == invitationId && i.CourseId == courseId);
        if (invitation == null) return false;
        if (invitation.Course.CreatorId != currentUserId)
            throw new UnauthorizedAccessException("Bạn không có quyền thu hồi lời mời này.");
        if (invitation.Status != Pending)
            throw new InvalidOperationException("Chỉ có thể thu hồi lời mời đang chờ phản hồi.");

        // Xóa luôn thông báo của học viên để không còn nút Đồng ý/Từ chối treo.
        var relatedNotifications = await _context.Notifications
            .Where(n => n.RelatedEntityType == InvitationEntity && n.RelatedEntityId == invitationId)
            .ToListAsync();
        _context.Notifications.RemoveRange(relatedNotifications);
        _context.CourseInvitations.Remove(invitation);

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<object> RespondAsync(int invitationId, int currentUserId, bool accept)
    {
        var invitation = await _context.CourseInvitations
            .Include(i => i.Course)
            .Include(i => i.InviteeUser)
            .FirstOrDefaultAsync(i => i.InvitationId == invitationId);

        if (invitation == null)
            throw new KeyNotFoundException("Lời mời không tồn tại hoặc đã bị thu hồi.");
        if (invitation.InviteeUserId != currentUserId)
            throw new UnauthorizedAccessException("Bạn không có quyền phản hồi lời mời này.");
        if (invitation.Status != Pending)
            throw new InvalidOperationException("Lời mời này đã được phản hồi trước đó.");

        await using var tx = await _context.Database.BeginTransactionAsync();

        invitation.Status = accept ? Accepted : Declined;
        invitation.RespondedAt = DateTime.UtcNow;

        if (accept)
        {
            bool enrolled = await _context.Enrollments
                .AnyAsync(e => e.UserId == currentUserId && e.CourseId == invitation.CourseId);
            if (!enrolled)
            {
                _context.Enrollments.Add(new Enrollment
                {
                    UserId = currentUserId,
                    CourseId = invitation.CourseId,
                    Status = "LEARNING",
                    ProgressPercent = 0,
                    EnrolledAt = DateTime.UtcNow
                });
            }
        }

        await _context.SaveChangesAsync();

        // Đánh dấu đã đọc thông báo lời mời của học viên
        await _context.Notifications
            .Where(n => n.UserId == currentUserId
                     && n.Type == "COURSE_INVITATION"
                     && n.RelatedEntityType == InvitationEntity
                     && n.RelatedEntityId == invitationId)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));

        if (accept)
        {
            await _notificationService.CreateNotificationAsync(
                invitation.InviterId,
                "INVITATION_ACCEPTED",
                $"Học viên {invitation.InviteeUser!.FullName} đã đồng ý tham gia khóa học {invitation.Course.Title} của bạn",
                CourseEntity,
                invitation.CourseId);
        }

        await tx.CommitAsync();

        return new { invitationId, status = invitation.Status, courseId = invitation.CourseId };
    }
}