using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace WebHoTroHocTap.Business.DTOs.Comment;

public class CreateCommentRequestDto
{
    public string Content { get; set; } = string.Empty;
}

public class CommentResponseDto
{
    public int CommentId { get; set; }
    public int CourseId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsOwner { get; set; } // true nếu là bình luận của user đang đăng nhập
    public CommentUserDto User { get; set; } = null!;
}

public class CommentUserDto
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
}
