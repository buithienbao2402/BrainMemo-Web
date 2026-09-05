using Microsoft.EntityFrameworkCore;
using WebHoTroHocTap.Business.DTOs.Block;
using WebHoTroHocTap.DataAccess;
using WebHoTroHocTap.DataAccess.Entities;

namespace WebHoTroHocTap.Business.Services;

public class BlockService : IBlockService
{
    private readonly AppDbContext _context;

    public BlockService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<int> CreateBlockAsync(int pageId, int userId, BlockRequestDto dto)
    {
        var page = await _context.Pages
            .Include(p => p.Chapter)
                .ThenInclude(c => c.Course)
            .FirstOrDefaultAsync(p => p.PageId == pageId);

        if (page == null) throw new KeyNotFoundException("Trang không tồn tại.");
        if (page.Chapter.Course.CreatorId != userId) throw new UnauthorizedAccessException("Không có quyền thêm block vào trang này.");

        var block = new Block
        {
            PageId = pageId,
            BlockType = dto.BlockType.ToUpper(),
            OrderIndex = dto.OrderIndex,
            ContentText = dto.BlockType.ToUpper() == "TEXT" ? dto.ContentText : null
        };

        _context.Blocks.Add(block);
        await _context.SaveChangesAsync();

        // Xử lý tạo FLASHCARD
        if (dto.BlockType.ToUpper() == "FLASHCARD" && dto.Flashcards != null)
        {
            var flashcardSet = new FlashcardSet { BlockId = block.BlockId };
            _context.FlashcardSets.Add(flashcardSet);
            await _context.SaveChangesAsync();

            foreach (var item in dto.Flashcards)
            {
                _context.Flashcards.Add(new Flashcard
                {
                    FlashcardSetId = flashcardSet.FlashcardSetId,
                    FrontText = item.FrontText,
                    BackText = item.BackText,
                    OrderIndex = item.OrderIndex
                });
            }
            await _context.SaveChangesAsync();
        }

        // Xử lý tạo QUIZ
        if (dto.BlockType.ToUpper() == "QUIZ" && dto.Questions != null)
        {
            var quiz = new Quiz { BlockId = block.BlockId };
            _context.Quizzes.Add(quiz);
            await _context.SaveChangesAsync();

            foreach (var q in dto.Questions)
            {
                var question = new QuizQuestion
                {
                    QuizId = quiz.QuizId,
                    QuestionText = q.QuestionText,
                    Explanation = q.Explanation,
                    OrderIndex = q.OrderIndex
                };
                _context.QuizQuestions.Add(question);
                await _context.SaveChangesAsync();

                foreach (var opt in q.Options)
                {
                    _context.QuizOptions.Add(new QuizOption
                    {
                        QuestionId = question.QuestionId,
                        OptionText = opt.OptionText,
                        IsCorrect = opt.IsCorrect
                    });
                }
            }
            await _context.SaveChangesAsync();
        }

        return block.BlockId;
    }

    public async Task<bool> UpdateBlockAsync(int blockId, int userId, BlockRequestDto dto)
    {
        var block = await _context.Blocks
            .Include(b => b.Page)
                .ThenInclude(p => p.Chapter)
                    .ThenInclude(c => c.Course)
            .FirstOrDefaultAsync(b => b.BlockId == blockId);

        if (block == null) return false;
        if (block.Page.Chapter.Course.CreatorId != userId) throw new UnauthorizedAccessException("Không có quyền chỉnh sửa block này.");

        block.OrderIndex = dto.OrderIndex;
        if (block.BlockType == "TEXT")
        {
            block.ContentText = dto.ContentText;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteBlockAsync(int blockId, int userId)
    {
        var block = await _context.Blocks
            .Include(b => b.Page)
                .ThenInclude(p => p.Chapter)
                    .ThenInclude(c => c.Course)
            .FirstOrDefaultAsync(b => b.BlockId == blockId);

        if (block == null) return false;
        if (block.Page.Chapter.Course.CreatorId != userId) throw new UnauthorizedAccessException("Không có quyền xóa block này.");

        _context.Blocks.Remove(block);
        await _context.SaveChangesAsync();
        return true;
    }
}