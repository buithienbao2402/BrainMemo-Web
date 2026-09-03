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
        var course = new Course
        {
            CreatorId = creatorId,
            Title = title,
            Description = description,
            CoverImage = coverImageKey,
            AccessType = accessType,
            Passcode = passcode,
            Status = "UPDATING"
        };

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        if (tags != null && tags.Count > 0)
        {
            foreach (var tagName in tags)
            {
                var trimmedTag = tagName.Trim().ToLower();
                var tagEntity = await _context.Tags.FirstOrDefaultAsync(t => t.TagName == trimmedTag);
                if (tagEntity == null)
                {
                    tagEntity = new Tag { TagName = trimmedTag };
                    _context.Tags.Add(tagEntity);
                    await _context.SaveChangesAsync();
                }
            }
        }

        return course.CourseId;
    }

    public async Task<object> GetCoursesAsync(string scope, string? search, string? tag, string? sort, int page, int pageSize, int? currentUserId)
    {
        var query = _context.Courses
            .Include(c => c.Creator)
            .AsQueryable();

        if (scope == "owned" && currentUserId.HasValue)
        {
            query = query.Where(c => c.CreatorId == currentUserId.Value);
        }
        else if (scope == "enrolled" && currentUserId.HasValue)
        {
            var enrolledCourseIds = _context.Enrollments
                .Where(e => e.UserId == currentUserId.Value)
                .Select(e => e.CourseId);
            query = query.Where(c => enrolledCourseIds.Contains(c.CourseId));
        }

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(c => c.Title.Contains(search));
        }

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
                accessType = c.AccessType.ToString(),
                status = c.Status.ToString(),
                creator = new { userId = c.Creator.UserId, fullName = c.Creator.FullName, avatarUrl = c.Creator.AvatarUrl },
                tags = new List<string>(),
                createdAt = c.CreatedAt
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
            .FirstOrDefaultAsync(c => c.CourseId == courseId);

        if (course == null) return null;

        bool isCreator = currentUserId.HasValue && course.CreatorId == currentUserId.Value;
        bool isEnrolled = currentUserId.HasValue && await _context.Enrollments.AnyAsync(e => e.UserId == currentUserId.Value && e.CourseId == courseId);

        if (course.AccessType.ToString() == "PRIVATE" && !isCreator && !isEnrolled)
        {
            throw new UnauthorizedAccessException("Khóa học này là riêng tư.");
        }

        if (course.AccessType.ToString() == "PROTECTED" && !isCreator)
        {
            if (string.IsNullOrEmpty(passcodeHeader) || passcodeHeader != course.Passcode)
            {
                throw new UnauthorizedAccessException("PASSCODE_REQUIRED_OR_INVALID");
            }
        }

        return new
        {
            courseId = course.CourseId,
            title = course.Title,
            description = course.Description,
            coverImage = course.CoverImage,
            accessType = course.AccessType.ToString(),
            status = course.Status.ToString(),
            creator = new { userId = course.Creator.UserId, fullName = course.Creator.FullName, avatarUrl = course.Creator.AvatarUrl },
            tags = new List<string>(),
            chapters = course.Chapters.Select(ch => new
            {
                id = ch.ChapterId,
                title = ch.Title,
                orderIndex = ch.OrderIndex,
                accessType = ch.AccessType.ToString()
            }).ToList()
        };
    }
}