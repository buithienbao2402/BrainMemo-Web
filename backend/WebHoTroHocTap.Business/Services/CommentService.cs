using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebHoTroHocTap.Business.DTOs.Comment;
using WebHoTroHocTap.DataAccess;
using WebHoTroHocTap.DataAccess.Entities;

namespace WebHoTroHocTap.Business.Services;

public class CommentService : ICommentService
{
    private readonly AppDbContext _context;

    public CommentService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<CommentResponseDto>> GetCommentsByCourseAsync(int courseId, int? currentUserId)
    {
        return await _context.Comments
            .Include(c => c.User)
            .Where(c => c.CourseId == courseId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CommentResponseDto
            {
                CommentId = c.CommentId,
                CourseId = c.CourseId,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                IsOwner = currentUserId.HasValue && c.UserId == currentUserId.Value,
                User = new CommentUserDto
                {
                    UserId = c.User.UserId,
                    FullName = c.User.FullName,
                    AvatarUrl = c.User.AvatarUrl
                }
            })
            .ToListAsync();
    }

    public async Task<int> CreateCommentAsync(int courseId, int userId, CreateCommentRequestDto dto)
    {
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == courseId);
        if (course == null) throw new KeyNotFoundException("Khóa học không tồn tại.");

        var comment = new Comment
        {
            CourseId = courseId,
            UserId = userId,
            Content = dto.Content,
            CreatedAt = DateTime.UtcNow
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        // Tự động tạo thông báo cho tác giả khóa học (nếu người bình luận không phải là tác giả)
        if (course.CreatorId != userId)
        {
            var commenter = await _context.Users.FindAsync(userId);
            _context.Notifications.Add(new Notification
            {
                UserId = course.CreatorId,
                Type = "NEW_COMMENT",
                Content = $"{commenter?.FullName ?? "Ai đó"} đã bình luận trong khóa học \"{course.Title}\"",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();
        }

        return comment.CommentId;
    }

    public async Task<bool> DeleteCommentAsync(int commentId, int userId)
    {
        var comment = await _context.Comments
            .Include(c => c.Course)
            .FirstOrDefaultAsync(c => c.CommentId == commentId);

        if (comment == null) return false;

        // Chỉ tác giả comment HOẶC người tạo khóa học mới có quyền xóa
        if (comment.UserId != userId && comment.Course.CreatorId != userId)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền xóa bình luận này.");
        }

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();
        return true;
    }
}
