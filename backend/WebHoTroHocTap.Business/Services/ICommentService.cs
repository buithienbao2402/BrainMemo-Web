using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebHoTroHocTap.Business.DTOs.Comment;

namespace WebHoTroHocTap.Business.Services;

public interface ICommentService
{
    Task<List<CommentResponseDto>> GetCommentsByCourseAsync(int courseId, int? currentUserId);
    Task<int> CreateCommentAsync(int courseId, int userId, CreateCommentRequestDto dto);
    Task<bool> DeleteCommentAsync(int commentId, int userId);
}
