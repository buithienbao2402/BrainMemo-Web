using Microsoft.EntityFrameworkCore;
using System.Linq;
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
        if (page.Chapter.Course.CreatorId != userId)
            throw new UnauthorizedAccessException("Không có quyền thêm block vào trang này.");

        string blockType = dto.BlockType.ToUpper();

        var block = new Block
        {
            PageId = pageId,
            BlockType = blockType,
            OrderIndex = dto.OrderIndex,
            ContentText = blockType == "TEXT" ? dto.ContentText : null
        };

        switch (blockType)
        {
            case "FLASHCARD":
                block.FlashcardSet = BuildFlashcardSet(dto.Flashcards);
                break;
            case "QUIZ":
                block.Quiz = BuildQuiz(dto.Questions);
                break;
        }

        // Gán qua navigation property phía trên -> EF tự dựng cả cây (Block + FlashcardSet/Quiz +
        // Flashcard/QuizQuestion/QuizOption con) và chỉ cần 1 lần SaveChangesAsync duy nhất.
        // Tránh hẳn kiểu "SaveChangesAsync trong vòng lặp" (partial-save risk) từng gặp ở CreateChapterAsync.
        _context.Blocks.Add(block);
        await _context.SaveChangesAsync();

        return block.BlockId;
    }

    public async Task<bool> UpdateBlockAsync(int blockId, int userId, BlockRequestDto dto)
    {
        var block = await _context.Blocks
            .Include(b => b.Page)
                .ThenInclude(p => p.Chapter)
                    .ThenInclude(c => c.Course)
            .Include(b => b.Quiz)
                .ThenInclude(q => q!.QuizQuestions)
                    .ThenInclude(qq => qq.QuizOptions)
            .Include(b => b.FlashcardSet)
                .ThenInclude(fs => fs!.Flashcards)
            // Quiz.QuizQuestions và FlashcardSet.Flashcards là 2 collection "song song" trong cùng
            // 1 Block -> nếu gộp chung 1 query sẽ bị cartesian explosion. AsSplitQuery tách thành
            // nhiều query riêng, an toàn hơn dù block đang xét chỉ có 1 trong 2 loại.
            .AsSplitQuery()
            .FirstOrDefaultAsync(b => b.BlockId == blockId);

        if (block == null) return false;
        if (block.Page.Chapter.Course.CreatorId != userId)
            throw new UnauthorizedAccessException("Không có quyền chỉnh sửa block này.");

        string incomingType = dto.BlockType.ToUpper();
        if (incomingType != block.BlockType)
            throw new ArgumentException("Không thể đổi loại block (blockType) khi cập nhật.");

        block.OrderIndex = dto.OrderIndex;

        switch (block.BlockType)
        {
            case "TEXT":
                block.ContentText = dto.ContentText;
                break;

            case "FLASHCARD":
                ValidateFlashcards(dto.Flashcards);
                ReplaceFlashcards(block.FlashcardSet, dto.Flashcards!);
                break;

            case "QUIZ":
                ValidateQuiz(dto.Questions);
                ReplaceQuizQuestions(block.Quiz, dto.Questions!);
                break;
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
        if (block.Page.Chapter.Course.CreatorId != userId)
            throw new UnauthorizedAccessException("Không có quyền xóa block này.");

        // Xóa Block sẽ cascade xóa Quiz/FlashcardSet + toàn bộ con (đã cấu hình ON DELETE CASCADE
        // trong init_db.sql) -> không cần xử lý gì thêm ở đây.
        _context.Blocks.Remove(block);
        await _context.SaveChangesAsync();
        return true;
    }

    // ------------------------------------------------------------------
    // Dựng cây entity mới (dùng khi Create)
    // ------------------------------------------------------------------

    private static FlashcardSet BuildFlashcardSet(List<FlashcardItemDto>? items)
    {
        ValidateFlashcards(items);
        var set = new FlashcardSet();
        foreach (var item in items!)
        {
            set.Flashcards.Add(new Flashcard
            {
                FrontText = item.FrontText,
                BackText = item.BackText,
                OrderIndex = item.OrderIndex
            });
        }
        return set;
    }

    private static Quiz BuildQuiz(List<QuizQuestionDto>? questions)
    {
        ValidateQuiz(questions);
        var quiz = new Quiz();
        foreach (var q in questions!)
        {
            quiz.QuizQuestions.Add(BuildQuestion(q));
        }
        return quiz;
    }

    private static QuizQuestion BuildQuestion(QuizQuestionDto q)
    {
        var question = new QuizQuestion
        {
            QuestionText = q.QuestionText,
            Explanation = q.Explanation,
            OrderIndex = q.OrderIndex
        };
        foreach (var opt in q.Options)
        {
            question.QuizOptions.Add(new QuizOption
            {
                OptionText = opt.OptionText,
                IsCorrect = opt.IsCorrect
            });
        }
        return question;
    }

    // ------------------------------------------------------------------
    // Thay thế toàn bộ con (dùng khi Update - full-replace theo api_contract.md mục 9)
    // Giữ nguyên dòng Quiz/FlashcardSet cha để không đụng UNIQUE constraint trên block_id.
    // ------------------------------------------------------------------

    private void ReplaceFlashcards(FlashcardSet? set, List<FlashcardItemDto> items)
    {
        if (set == null)
            throw new InvalidOperationException("Block flashcard đang thiếu dữ liệu FlashcardSet gốc.");

        _context.Flashcards.RemoveRange(set.Flashcards);
        set.Flashcards.Clear();

        foreach (var item in items)
        {
            set.Flashcards.Add(new Flashcard
            {
                FrontText = item.FrontText,
                BackText = item.BackText,
                OrderIndex = item.OrderIndex
            });
        }
    }

    private void ReplaceQuizQuestions(Quiz? quiz, List<QuizQuestionDto> questions)
    {
        if (quiz == null)
            throw new InvalidOperationException("Block quiz đang thiếu dữ liệu Quiz gốc.");

        foreach (var oldQuestion in quiz.QuizQuestions)
        {
            _context.QuizOptions.RemoveRange(oldQuestion.QuizOptions);
        }
        _context.QuizQuestions.RemoveRange(quiz.QuizQuestions);
        quiz.QuizQuestions.Clear();

        foreach (var q in questions)
        {
            quiz.QuizQuestions.Add(BuildQuestion(q));
        }
    }

    // ------------------------------------------------------------------
    // Validate - khớp ràng buộc nghiệp vụ trong tài liệu "luồng tạo quiz/flashcard":
    // quiz mỗi câu hỏi tối thiểu 2 đáp án + đúng 1 đáp án đúng.
    // ------------------------------------------------------------------

    private static void ValidateFlashcards(List<FlashcardItemDto>? items)
    {
        if (items == null || items.Count == 0)
            throw new ArgumentException("Block Flashcard cần ít nhất 1 cặp mặt trước/sau.");

        foreach (var item in items)
        {
            if (string.IsNullOrWhiteSpace(item.FrontText) || string.IsNullOrWhiteSpace(item.BackText))
                throw new ArgumentException("Mỗi flashcard phải có đủ mặt trước và mặt sau.");
        }
    }

    private static void ValidateQuiz(List<QuizQuestionDto>? questions)
    {
        if (questions == null || questions.Count == 0)
            throw new ArgumentException("Block Quiz cần ít nhất 1 câu hỏi.");

        foreach (var q in questions)
        {
            if (string.IsNullOrWhiteSpace(q.QuestionText))
                throw new ArgumentException("Câu hỏi không được để trống.");

            if (q.Options == null || q.Options.Count < 2)
                throw new ArgumentException($"Câu hỏi \"{q.QuestionText}\" cần tối thiểu 2 đáp án.");

            if (q.Options.Count(o => o.IsCorrect) != 1)
                throw new ArgumentException($"Câu hỏi \"{q.QuestionText}\" phải có đúng 1 đáp án đúng.");
        }
    }
}