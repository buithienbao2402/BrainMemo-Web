using Microsoft.EntityFrameworkCore;
using WebHoTroHocTap.Business.DTOs.Page;
using WebHoTroHocTap.DataAccess;
using WebHoTroHocTap.DataAccess.Entities;

namespace WebHoTroHocTap.Business.Services;

public class PageService : IPageService
{
    private readonly AppDbContext _context;

    public PageService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<int> CreatePageAsync(int chapterId, int userId, PageRequestDto dto)
    {
        var chapter = await _context.Chapters.Include(c => c.Course).FirstOrDefaultAsync(c => c.ChapterId == chapterId);
        if (chapter == null) throw new KeyNotFoundException("Chương không tồn tại.");
        if (chapter.Course.CreatorId != userId) throw new UnauthorizedAccessException("Không có quyền tạo trang trong chương này.");

        var page = new Page
        {
            ChapterId = chapterId,
            Title = dto.Title,
            OrderIndex = dto.OrderIndex
        };

        _context.Pages.Add(page);
        await _context.SaveChangesAsync();
        return page.PageId;
    }

    public async Task<object> GetPagesByChapterAsync(int chapterId)
    {
        return await _context.Pages
            .Where(p => p.ChapterId == chapterId)
            .OrderBy(p => p.OrderIndex)
            .Select(p => new { id = p.PageId, chapterId = p.ChapterId, title = p.Title, orderIndex = p.OrderIndex })
            .ToListAsync();
    }

    public async Task<object?> GetPageDetailAsync(int pageId)
    {
        var page = await _context.Pages
            .Include(p => p.Blocks.OrderBy(b => b.OrderIndex))
                .ThenInclude(b => b.Quiz)
                    .ThenInclude(q => q!.QuizQuestions.OrderBy(qq => qq.OrderIndex))
                        .ThenInclude(qq => qq.QuizOptions)
            .Include(p => p.Blocks.OrderBy(b => b.OrderIndex))
                .ThenInclude(b => b.FlashcardSet)
                    .ThenInclude(fs => fs!.Flashcards.OrderBy(fc => fc.OrderIndex))
            .FirstOrDefaultAsync(p => p.PageId == pageId);

        if (page == null) return null;

        return new
        {
            id = page.PageId,
            chapterId = page.ChapterId,
            title = page.Title,
            orderIndex = page.OrderIndex,
            Blocks = page.Blocks.Select(b => new
            {
                id = b.BlockId,
                blockType = b.BlockType,
                orderIndex = b.OrderIndex,
                contentText = b.ContentText,
                quiz = b.Quiz == null ? null : new
                {
                    b.Quiz.QuizId,
                    Questions = b.Quiz.QuizQuestions.Select(q => new
                    {
                        q.QuestionId,
                        q.QuestionText,
                        q.Explanation,
                        q.OrderIndex,
                        Options = q.QuizOptions.Select(o => new
                        {
                            o.OptionId,
                            o.OptionText,
                            o.IsCorrect
                        }).ToList()
                    }).ToList()
                },
                flashcards = b.FlashcardSet == null ? null : b.FlashcardSet.Flashcards.Select(f => new
                {
                    f.FlashcardId,
                    f.FrontText,
                    f.BackText,
                    f.OrderIndex
                }).ToList()
            }).ToList()
        };
    }

    public async Task<bool> UpdatePageAsync(int pageId, int userId, PageRequestDto dto)
    {
        var page = await _context.Pages
            .Include(p => p.Chapter)
                .ThenInclude(c => c.Course)
            .FirstOrDefaultAsync(p => p.PageId == pageId);

        if (page == null) return false;
        if (page.Chapter.Course.CreatorId != userId) throw new UnauthorizedAccessException("Không có quyền sửa trang này.");

        page.Title = dto.Title;
        page.OrderIndex = dto.OrderIndex;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeletePageAsync(int pageId, int userId)
    {
        var page = await _context.Pages
            .Include(p => p.Chapter)
                .ThenInclude(c => c.Course)
            .FirstOrDefaultAsync(p => p.PageId == pageId);

        if (page == null) return false;
        if (page.Chapter.Course.CreatorId != userId) throw new UnauthorizedAccessException("Không có quyền xóa trang này.");

        _context.Pages.Remove(page);
        await _context.SaveChangesAsync();
        return true;
    }
}