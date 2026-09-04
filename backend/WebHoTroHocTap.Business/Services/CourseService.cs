using Microsoft.EntityFrameworkCore;
using WebHoTroHocTap.DataAccess;
using WebHoTroHocTap.DataAccess.Entities;

namespace WebHoTroHocTap.Business.Services;

public class CourseService : ICourseService
{
    private readonly AppDbContext _context;

    public CourseService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<int> CreateCourseAsync(int creatorId, string title, string? description, string? coverImageKey, string accessType, string? passcode, List<string> tags)
    {
        string? hashedPasscode = null;
        if (accessType == "PROTECTED" && !string.IsNullOrWhiteSpace(passcode))
        {
            hashedPasscode = BCrypt.Net.BCrypt.HashPassword(passcode);
        }

        var course = new Course
        {
            CreatorId = creatorId,
            Title = title,
            Description = description,
            CoverImage = coverImageKey,
            AccessType = accessType,
            Passcode = hashedPasscode,
            Status = "UPDATING"
        };

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        await SyncCourseTagsAsync(course.CourseId, tags);

        return course.CourseId;
    }

    public async Task<bool> UpdateCourseAsync(int courseId, int creatorId, string title, string? description, string? coverImageKey, string accessType, string? passcode, List<string> tags)
    {
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == courseId);
        if (course == null) return false;
        if (course.CreatorId != creatorId) throw new UnauthorizedAccessException("Bạn không có quyền chỉnh sửa khóa học này.");

        course.Title = title;
        course.Description = description;
        course.CoverImage = coverImageKey;
        course.AccessType = accessType;

        if (accessType == "PROTECTED")
        {
            if (!string.IsNullOrWhiteSpace(passcode))
            {
                course.Passcode = BCrypt.Net.BCrypt.HashPassword(passcode);
            }
        }
        else
        {
            course.Passcode = null;
        }

        course.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        await SyncCourseTagsAsync(course.CourseId, tags);

        return true;
    }

    public async Task<bool> DeleteCourseAsync(int courseId, int creatorId)
    {
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == courseId);
        if (course == null) return false;
        if (course.CreatorId != creatorId) throw new UnauthorizedAccessException("Bạn không có quyền xóa khóa học này.");

        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<object> GetCoursesAsync(string scope, string? search, string? tag, string? sort, int page, int pageSize, int? currentUserId)
    {
        var query = _context.Courses
            .Include(c => c.Creator)
            .Include(c => c.Enrollments)
            .Include(c => c.Comments)
            .Include(c => c.CourseTags)
                .ThenInclude(ct => ct.Tag)
            .AsQueryable();

        if (scope == "owned" && currentUserId.HasValue)
        {
            query = query.Where(c => c.CreatorId == currentUserId.Value);
        }
        else if (scope == "enrolled" && currentUserId.HasValue)
        {
            query = query.Where(c => c.Enrollments.Any(e => e.UserId == currentUserId.Value));
        }
        else
        {
            query = query.Where(c => c.AccessType == "PUBLIC");
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(c => c.Title.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(tag))
        {
            string cleanTag = tag.Trim().ToLower();
            query = query.Where(c => c.CourseTags.Any(ct => ct.Tag.TagName == cleanTag));
        }

        query = sort switch
        {
            "updated" => query.OrderByDescending(c => c.UpdatedAt),
            "participants" => query.OrderByDescending(c => c.Enrollments.Count),
            "comments" => query.OrderByDescending(c => c.Comments.Count),
            _ => query.OrderByDescending(c => c.CreatedAt)
        };

        int totalItems = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new
            {
                courseId = c.CourseId,
                title = c.Title,
                description = c.Description,
                coverImage = c.CoverImage,
                accessType = c.AccessType,
                status = c.Status,
                creator = new { userId = c.Creator.UserId, fullName = c.Creator.FullName, avatarUrl = c.Creator.AvatarUrl },
                tags = c.CourseTags.Select(ct => ct.Tag.TagName).ToList(),
                createdAt = c.CreatedAt,
                updatedAt = c.UpdatedAt
            })
            .ToListAsync();

        return new
        {
            items,
            page,
            pageSize,
            totalItems,
            totalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
        };
    }

    public async Task<object?> GetCourseByIdAsync(int courseId, int? currentUserId, string? passcodeHeader)
    {
        var course = await _context.Courses
            .Include(c => c.Creator)
            .Include(c => c.Chapters.OrderBy(ch => ch.OrderIndex))
            .Include(c => c.CourseTags)
                .ThenInclude(ct => ct.Tag)
            .FirstOrDefaultAsync(c => c.CourseId == courseId);

        if (course == null) return null;

        bool isCreator = currentUserId.HasValue && course.CreatorId == currentUserId.Value;
        bool isEnrolled = currentUserId.HasValue && await _context.Enrollments.AnyAsync(e => e.UserId == currentUserId.Value && e.CourseId == courseId);

        if (course.AccessType == "PRIVATE" && !isCreator && !isEnrolled)
        {
            throw new UnauthorizedAccessException("Khóa học này là riêng tư.");
        }

        if (course.AccessType == "PROTECTED" && !isCreator)
        {
            if (string.IsNullOrEmpty(passcodeHeader) || string.IsNullOrEmpty(course.Passcode) || !BCrypt.Net.BCrypt.Verify(passcodeHeader, course.Passcode))
            {
                throw new UnauthorizedAccessException("PASSCODE_INVALID");
            }
        }

        return new
        {
            courseId = course.CourseId,
            title = course.Title,
            description = course.Description,
            coverImage = course.CoverImage,
            accessType = course.AccessType,
            status = course.Status,
            creator = new { userId = course.Creator.UserId, fullName = course.Creator.FullName, avatarUrl = course.Creator.AvatarUrl },
            tags = course.CourseTags.Select(ct => ct.Tag.TagName).ToList(),
            chapters = course.Chapters.Select(ch => new
            {
                id = ch.ChapterId,
                title = ch.Title,
                orderIndex = ch.OrderIndex,
                accessType = ch.AccessType
            }).ToList(),
            createdAt = course.CreatedAt,
            updatedAt = course.UpdatedAt
        };
    }

    private async Task SyncCourseTagsAsync(int courseId, List<string>? tags)
    {
        var existingCourseTags = _context.CourseTags.Where(ct => ct.CourseId == courseId);
        _context.CourseTags.RemoveRange(existingCourseTags);
        await _context.SaveChangesAsync();

        if (tags == null || tags.Count == 0) return;

        foreach (var rawTag in tags)
        {
            var cleanTag = rawTag.Trim().ToLower();
            if (string.IsNullOrWhiteSpace(cleanTag)) continue;

            var tagEntity = await _context.Tags.FirstOrDefaultAsync(t => t.TagName == cleanTag);
            if (tagEntity == null)
            {
                tagEntity = new Tag { TagName = cleanTag };
                _context.Tags.Add(tagEntity);
                await _context.SaveChangesAsync();
            }

            _context.CourseTags.Add(new CourseTag
            {
                CourseId = courseId,
                TagId = tagEntity.TagId
            });
        }
        await _context.SaveChangesAsync();
    }
}