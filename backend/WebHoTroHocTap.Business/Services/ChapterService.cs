using Microsoft.EntityFrameworkCore;
using WebHoTroHocTap.Business.DTOs.Chapter;
using WebHoTroHocTap.DataAccess;
using WebHoTroHocTap.DataAccess.Entities;

namespace WebHoTroHocTap.Business.Services;

public class ChapterService : IChapterService
{
    private readonly AppDbContext _context;
    private readonly INotificationService _notificationService;

    public ChapterService(AppDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<int> CreateChapterAsync(int courseId, int userId, ChapterRequestDto dto)
    {
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == courseId);
        if (course == null) throw new KeyNotFoundException("Khóa học không tồn tại.");
        if (course.CreatorId != userId) throw new UnauthorizedAccessException("Chỉ người tạo khóa học mới có quyền thêm chương.");

        string? hashedPasscode = null;
        if (dto.AccessType == "PROTECTED" && !string.IsNullOrWhiteSpace(dto.Passcode))
        {
            hashedPasscode = BCrypt.Net.BCrypt.HashPassword(dto.Passcode);
        }

        int? maxOrderIndex = await _context.Chapters
            .Where(c => c.CourseId == courseId)
            .Select(c => (int?)c.OrderIndex)
            .MaxAsync();

        int nextOrderIndex = (maxOrderIndex ?? -1) + 1;

        var chapter = new Chapter
        {
            CourseId = courseId,
            Title = dto.Title,
            OrderIndex = nextOrderIndex,
            AccessType = dto.AccessType ?? "PUBLIC",
            Passcode = hashedPasscode,
            IsDraft = dto.IsDraft,
            CreatedAt = DateTime.UtcNow
        };

        _context.Chapters.Add(chapter);
        await _context.SaveChangesAsync();

        if (!dto.IsDraft)
        {
            await NotifyNewChapterAsync(course, chapter);
        }

        return chapter.ChapterId;
    }

    public async Task<object> GetChaptersAsync(int courseId, int? currentUserId, bool isDraft)
    {
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == courseId);
        if (course == null) throw new KeyNotFoundException("Khóa học không tồn tại.");

        bool isCreator = currentUserId.HasValue && course.CreatorId == currentUserId.Value;

        // Nếu xem danh sách chương nháp thì BẮT BUỘC phải là tác giả của khóa học
        if (isDraft && !isCreator)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền xem danh sách chương nháp của khóa học này.");
        }

        var chapters = await _context.Chapters
            .Where(c => c.CourseId == courseId && c.IsDraft == isDraft)
            .OrderBy(c => c.OrderIndex)
            .Select(c => new
            {
                id = c.ChapterId,
                courseId = c.CourseId,
                title = c.Title,
                orderIndex = c.OrderIndex,
                accessType = c.AccessType,
                isDraft = c.IsDraft,
                createdAt = c.CreatedAt,
                totalPages = c.Pages.Count
            })
            .ToListAsync();

        return chapters;
    }

    public async Task<object?> GetChapterByIdAsync(int chapterId, int? currentUserId, string? passcodeHeader)
    {
        var chapter = await _context.Chapters
            .Include(c => c.Course)
            .Include(c => c.Pages.OrderBy(p => p.OrderIndex))
            .FirstOrDefaultAsync(c => c.ChapterId == chapterId);

        if (chapter == null) return null;

        bool isCreator = currentUserId.HasValue && chapter.Course.CreatorId == currentUserId.Value;
        
        bool isEnrolled = currentUserId.HasValue &&
            await _context.Enrollments.AnyAsync(e => e.UserId == currentUserId.Value && e.CourseId == chapter.CourseId);

        if (chapter.IsDraft && !isCreator)
        {
            throw new UnauthorizedAccessException("Chương này đang ở trạng thái nháp.");
        }

        if (chapter.AccessType == "PROTECTED" && !isCreator)
        {
            if (string.IsNullOrEmpty(passcodeHeader) || string.IsNullOrEmpty(chapter.Passcode) || !BCrypt.Net.BCrypt.Verify(passcodeHeader, chapter.Passcode))
            {
                throw new UnauthorizedAccessException("PASSCODE_INVALID");
            }
        }

        if (chapter.AccessType == "PRIVATE" && !isCreator && !isEnrolled)
            throw new UnauthorizedAccessException("Chương này ở chế độ riêng tư.");

        return new
        {
            id = chapter.ChapterId,
            courseId = chapter.CourseId,
            title = chapter.Title,
            orderIndex = chapter.OrderIndex,
            accessType = chapter.AccessType,
            isDraft = chapter.IsDraft,
            createdAt = chapter.CreatedAt,
            pages = chapter.Pages.Select(p => new { id = p.PageId, title = p.Title, orderIndex = p.OrderIndex }).ToList()
        };
    }

    public async Task<bool> UpdateChapterAsync(int chapterId, int userId, ChapterRequestDto dto)
    {
        var chapter = await _context.Chapters.Include(c => c.Course).FirstOrDefaultAsync(c => c.ChapterId == chapterId);
        if (chapter == null) return false;
        if (chapter.Course.CreatorId != userId) throw new UnauthorizedAccessException("Bạn không có quyền chỉnh sửa chương này.");

        bool wasDraft = chapter.IsDraft;

        chapter.Title = dto.Title;
        chapter.AccessType = dto.AccessType ?? "PUBLIC";
        chapter.IsDraft = dto.IsDraft;

        if (dto.AccessType == "PROTECTED")
        {
            if (!string.IsNullOrWhiteSpace(dto.Passcode))
            {
                chapter.Passcode = BCrypt.Net.BCrypt.HashPassword(dto.Passcode);
            }
        }
        else
        {
            chapter.Passcode = null;
        }

        await _context.SaveChangesAsync();

        if (wasDraft && !chapter.IsDraft)
        {
            await NotifyNewChapterAsync(chapter.Course, chapter);
        }

        return true;
    }

    public async Task<bool> DeleteChapterAsync(int chapterId, int userId)
    {
        var chapter = await _context.Chapters.Include(c => c.Course).FirstOrDefaultAsync(c => c.ChapterId == chapterId);
        if (chapter == null) return false;
        if (chapter.Course.CreatorId != userId) throw new UnauthorizedAccessException("Bạn không có quyền xóa chương này.");

        _context.Chapters.Remove(chapter);
        await _context.SaveChangesAsync();
        return true;
    }
    private async Task NotifyNewChapterAsync(Course course, Chapter chapter)
    {
        var enrolledUserIds = await _context.Enrollments
            .Where(e => e.CourseId == course.CourseId)
            .Select(e => e.UserId)
            .ToListAsync();

        if (enrolledUserIds.Count == 0) return;

        await _notificationService.CreateNotificationsAsync(
            enrolledUserIds,
            "NEW_CHAPTER",
            $"Khóa học {course.Title} vừa có chương mới: {chapter.Title}"
        );
    }
}
