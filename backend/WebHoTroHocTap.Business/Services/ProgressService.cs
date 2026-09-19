using Microsoft.EntityFrameworkCore;
using WebHoTroHocTap.Business.DTOs.Progress;
using WebHoTroHocTap.DataAccess;
using WebHoTroHocTap.DataAccess.Entities;

namespace WebHoTroHocTap.Business.Services;

public class ProgressService : IProgressService
{
    private const int PassThresholdPercent = 70;
    private readonly AppDbContext _context;

    public ProgressService(AppDbContext context) => _context = context;

    public async Task<object> CompletePageAsync(int pageId, int userId)
    {
        var (page, enrollment) = await LoadPageAndEnrollmentAsync(pageId, userId);

        bool hasQuizBlock = await _context.Blocks.AnyAsync(b => b.PageId == pageId && b.BlockType == "QUIZ");
        if (hasQuizBlock)
            throw new InvalidOperationException("Trang này có Quiz — phải nộp bài qua /quiz/submit, không dùng /complete.");

        await MarkPageCompletedAsync(enrollment, pageId);
        await RecalculateEnrollmentProgressAsync(enrollment);

        return new { pageId, isCompleted = true, progressPercent = enrollment.ProgressPercent };
    }

    public async Task<object> SubmitQuizAsync(int pageId, int userId, QuizSubmitRequestDto dto)
    {
        var (page, enrollment) = await LoadPageAndEnrollmentAsync(pageId, userId);

        // Lấy toàn bộ câu hỏi quiz của TẤT CẢ block QUIZ trên trang này (gộp chung, xem giả định #2).
        var questionIds = await _context.Blocks
            .Where(b => b.PageId == pageId && b.BlockType == "QUIZ")
            .SelectMany(b => b.Quiz!.QuizQuestions.Select(q => q.QuestionId))
            .ToListAsync();

        if (questionIds.Count == 0)
            throw new InvalidOperationException("Trang này không có câu hỏi Quiz nào để chấm.");

        var correctOptionByQuestion = await _context.QuizOptions
            .Where(o => questionIds.Contains(o.QuestionId) && o.IsCorrect)
            .ToDictionaryAsync(o => o.QuestionId, o => o.OptionId);

        int correctCount = dto.Answers.Count(a =>
            correctOptionByQuestion.TryGetValue(a.QuestionId, out var correctId) && correctId == a.SelectedOptionId);

        double scorePercent = Math.Round((double)correctCount / questionIds.Count * 100, 2);
        bool passed = scorePercent >= PassThresholdPercent;

        if (passed)
        {
            await MarkPageCompletedAsync(enrollment, pageId);
            await RecalculateEnrollmentProgressAsync(enrollment);
        }

        return new
        {
            scorePercent,
            passed,
            requiredPercent = PassThresholdPercent,
            progressPercent = enrollment.ProgressPercent
        };
    }

    public async Task<object> GetChapterProgressAsync(int chapterId, int userId)
    {
        var chapter = await _context.Chapters
            .Include(c => c.Pages)
            .FirstOrDefaultAsync(c => c.ChapterId == chapterId);
        if (chapter == null) throw new KeyNotFoundException("Chương không tồn tại.");

        var enrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == chapter.CourseId);

        int totalPages = chapter.Pages.Count;
        if (enrollment == null || totalPages == 0)
            return new { chapterId, totalPages, completedPages = 0, progressPercent = 0 };

        var pageIds = chapter.Pages.Select(p => p.PageId).ToList();
        int completedPages = await _context.PageProgresses
            .CountAsync(pp => pp.EnrollmentId == enrollment.EnrollmentId
                            && pageIds.Contains(pp.PageId)
                            && pp.IsCompleted);

        int progressPercent = (int)Math.Round((double)completedPages / totalPages * 100);
        return new { chapterId, totalPages, completedPages, progressPercent };
    }

    // ---------------- helpers ----------------

    private async Task<(Page page, Enrollment enrollment)> LoadPageAndEnrollmentAsync(int pageId, int userId)
    {
        var page = await _context.Pages
            .Include(p => p.Chapter)
            .FirstOrDefaultAsync(p => p.PageId == pageId);
        if (page == null) throw new KeyNotFoundException("Trang không tồn tại.");

        var enrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == page.Chapter.CourseId);
        if (enrollment == null)
            throw new UnauthorizedAccessException("Bạn cần ghi danh khóa học này trước khi đánh dấu tiến độ.");

        return (page, enrollment);
    }

    private async Task MarkPageCompletedAsync(Enrollment enrollment, int pageId)
    {
        var progress = await _context.PageProgresses
            .FirstOrDefaultAsync(pp => pp.EnrollmentId == enrollment.EnrollmentId && pp.PageId == pageId);

        if (progress == null)
        {
            progress = new PageProgress
            {
                EnrollmentId = enrollment.EnrollmentId,
                PageId = pageId,
                IsCompleted = true,
                CompletedAt = DateTime.UtcNow
            };
            _context.PageProgresses.Add(progress);
        }
        else if (!progress.IsCompleted)
        {
            progress.IsCompleted = true;
            progress.CompletedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// progress_percent = % SỐ CHƯƠNG đã hoàn thành / tổng số chương (giả định #4).
    /// 1 chương "hoàn thành" = tất cả trang trong chương có page_progress.is_completed = true (giả định #5).
    /// Nếu đạt 100% -> enrollment.status = COMPLETED.
    /// </summary>
    private async Task RecalculateEnrollmentProgressAsync(Enrollment enrollment)
    {
        var chapters = await _context.Chapters
            .Where(c => c.CourseId == enrollment.CourseId)
            .Include(c => c.Pages)
            .ToListAsync();

        int totalChapters = chapters.Count;
        if (totalChapters == 0) return;

        var completedPageIds = await _context.PageProgresses
            .Where(pp => pp.EnrollmentId == enrollment.EnrollmentId && pp.IsCompleted)
            .Select(pp => pp.PageId)
            .ToListAsync();
        var completedPageSet = completedPageIds.ToHashSet();

        int completedChapters = chapters.Count(ch =>
            ch.Pages.Count > 0 && ch.Pages.All(p => completedPageSet.Contains(p.PageId)));

        decimal newPercent = Math.Round((decimal)completedChapters / totalChapters * 100, 2);

        enrollment.ProgressPercent = newPercent;
        if (newPercent >= 100)
            enrollment.Status = "COMPLETED";

        await _context.SaveChangesAsync();
    }

    public async Task<object> GetCourseProgressAsync(int courseId, int userId)
    {
        var enrollment = await _context.Enrollments
            .Include(e => e.LastPage!).ThenInclude(p => p.Chapter)
            .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId);

        var chapters = await _context.Chapters
            .Where(c => c.CourseId == courseId)
            .Include(c => c.Pages)
            .OrderBy(c => c.OrderIndex)
            .ToListAsync();

        if (enrollment == null)
        {
            return new
            {
                isEnrolled = false,
                progressPercent = 0,
                currentChapterId = (int?)null,
                currentChapterOrderIndex = (int?)null,
                currentPageId = (int?)null,
                chapters = chapters.Select(ch => new { chapterId = ch.ChapterId, isCompleted = false }).ToList()
            };
        }

        var completedSet = (await _context.PageProgresses
            .Where(pp => pp.EnrollmentId == enrollment.EnrollmentId && pp.IsCompleted)
            .Select(pp => pp.PageId)
            .ToListAsync()).ToHashSet();

        var chapterStates = chapters.Select(ch => new
        {
            chapterId = ch.ChapterId,
            isCompleted = ch.Pages.Count > 0 && ch.Pages.All(p => completedSet.Contains(p.PageId))
        }).ToList();

        return new
        {
            isEnrolled = true,
            progressPercent = enrollment.ProgressPercent,
            currentChapterId = enrollment.LastPage?.ChapterId,
            currentChapterOrderIndex = enrollment.LastPage?.Chapter?.OrderIndex,
            currentPageId = enrollment.LastPageId,
            chapters = chapterStates
        };
    }
}