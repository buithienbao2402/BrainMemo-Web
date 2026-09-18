using Microsoft.EntityFrameworkCore;
using WebHoTroHocTap.DataAccess;
using WebHoTroHocTap.DataAccess.Entities;

namespace WebHoTroHocTap.Business.Services;

public class LearningService : ILearningService
{
    private readonly AppDbContext _context;
    public LearningService(AppDbContext context) => _context = context;

    public async Task<object> GetDashboardSummaryAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);

        var enrollments = await _context.Enrollments
            .Include(e => e.Course)
            .Include(e => e.LastPage)
                .ThenInclude(p => p!.Chapter)
            .Where(e => e.UserId == userId)
            .ToListAsync();

        var learning = enrollments.Where(e => e.Status == "LEARNING").Select(MapCourseCard).ToList();
        var completed = enrollments.Where(e => e.Status == "COMPLETED").Select(MapCourseCard).ToList();

        // Đếm chương đã "vào đọc" — hiện chỉ tính được chương có ít nhất 1 page
        // page_progress (tức là chương có page đã hoàn thành/đã submit quiz).
        // Nếu muốn đúng "đã vào đọc, bất kể hoàn thành hay chưa" cần thêm bước
        // ghi nhận view trong PageService (xem câu hỏi cuối bài).
        int chaptersReadCount = await _context.PageProgresses
            .Where(pp => pp.Enrollment.UserId == userId)
            .Select(pp => pp.Page.ChapterId)
            .Distinct()
            .CountAsync();

        int commentsCount = await _context.Comments.CountAsync(c => c.UserId == userId);

        var createdCourses = await _context.Courses
            .Where(c => c.CreatorId == userId)
            .OrderByDescending(c => c.UpdatedAt)
            .Select(c => new { courseId = c.CourseId, title = c.Title, coverImage = c.CoverImage })
            .ToListAsync();

        return new
        {
            bio = user?.Bio,
            totalActiveSeconds = user?.TotalActiveSeconds ?? 0,
            chaptersReadCount,
            commentsCount,
            coursesCreatedCount = createdCourses.Count,
            courses = new { learning, completed, created = createdCourses }
        };
    }

    private static object MapCourseCard(Enrollment e)
    {
        return new
        {
            courseId = e.CourseId,
            title = e.Course.Title,
            coverImage = e.Course.CoverImage,
            progressPercent = e.ProgressPercent,
            currentChapterId = e.LastPage?.ChapterId,
            currentChapterOrderIndex = e.LastPage?.Chapter?.OrderIndex,
            currentPageId = e.LastPageId,
        };
    }
}