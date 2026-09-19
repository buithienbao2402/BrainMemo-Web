using WebHoTroHocTap.Business.DTOs.Progress;

namespace WebHoTroHocTap.Business.Services;

public interface IProgressService
{
    /// <summary>Dùng cho trang KHÔNG có block QUIZ (TEXT/MEDIA/FLASHCARD).</summary>
    Task<object> CompletePageAsync(int pageId, int userId);

    /// <summary>Chấm điểm quiz của 1 trang, tự đánh dấu hoàn thành trang nếu đạt ≥70%.</summary>
    Task<object> SubmitQuizAsync(int pageId, int userId, QuizSubmitRequestDto dto);

    /// <summary>Tiến độ 1 chương: số trang đã đọc / tổng số trang, dùng cho màn Đọc chương.</summary>
    Task<object> GetChapterProgressAsync(int chapterId, int userId);

    Task<object> GetCourseProgressAsync(int courseId, int userId);
}