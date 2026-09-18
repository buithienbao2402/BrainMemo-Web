using Microsoft.EntityFrameworkCore;
using WebHoTroHocTap.DataAccess;
using WebHoTroHocTap.DataAccess.Entities;

namespace WebHoTroHocTap.Business.Services;

public class CommentService : ICommentService
{
    private readonly AppDbContext _context;
    private readonly INotificationService _notificationService;
    public CommentService(AppDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<object> GetCommentsAsync(int courseId, int page, int pageSize)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 20 : Math.Min(pageSize, 100);

        var query = _context.Comments.Include(c => c.User)
            .Where(c => c.CourseId == courseId)
            .OrderByDescending(c => c.CreatedAt);

        int totalItems = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(c => new
            {
                id = c.CommentId,
                authorId = c.UserId,
                authorName = c.User.FullName,
                authorAvatarUrl = c.User.AvatarUrl,
                content = c.Content,
                createdAt = c.CreatedAt
            })
            .ToListAsync();

        return new { items, page, pageSize, totalItems, totalPages = (int)Math.Ceiling(totalItems / (double)pageSize) };
    }

    public async Task<object> CreateCommentAsync(int courseId, int userId, string content)
    {
        var comment = new Comment { CourseId = courseId, UserId = userId, Content = content };
        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        var user = await _context.Users.FindAsync(userId);

        var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == courseId);
        if (course != null && course.CreatorId != userId)
        {
            await _notificationService.CreateNotificationAsync(
                course.CreatorId,
                "NEW_COMMENT",
                $"{user!.FullName} đã bình luận trong khóa học {course.Title}"
            );
        }

        return new
        {
            id = comment.CommentId,
            authorId = userId,
            authorName = user!.FullName,
            authorAvatarUrl = user.AvatarUrl,
            content = comment.Content,
            createdAt = comment.CreatedAt
        };
    }

    public async Task<bool> UpdateCommentAsync(int commentId, int userId, string content)
    {
        var comment = await _context.Comments.FirstOrDefaultAsync(c => c.CommentId == commentId);
        if (comment == null) return false;
        if (comment.UserId != userId) throw new UnauthorizedAccessException("Bạn không có quyền sửa bình luận này.");

        comment.Content = content;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteCommentAsync(int commentId, int userId)
    {
        var comment = await _context.Comments.FirstOrDefaultAsync(c => c.CommentId == commentId);
        if (comment == null) return false;
        if (comment.UserId != userId) throw new UnauthorizedAccessException("Bạn không có quyền xóa bình luận này.");

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();
        return true;
    }
}