using Microsoft.EntityFrameworkCore;
using WebHoTroHocTap.Business.Exceptions;
using WebHoTroHocTap.DataAccess;
using WebHoTroHocTap.DataAccess.Entities;
using WebHoTroHocTap.DataAccess.Enums;

namespace WebHoTroHocTap.Business.Services;

public class CourseService : ICourseService
{
    private const int DefaultPageSize = 20;
    private const int MaxPageSize = 100;

    private readonly AppDbContext _context;

    public CourseService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<int> CreateCourseAsync(int creatorId, string title, string? description, string? coverImageKey, AccessType accessType, string? passcode, List<string> tags)
    {
        string? hashedPasscode = ResolvePasscodeHash(accessType, passcode, existingPasscodeHash: null);

        var course = new Course
        {
            CreatorId = creatorId,
            Title = title,
            Description = description,
            CoverImage = coverImageKey,
            AccessType = accessType,
            Passcode = hashedPasscode,
            Status = CourseStatus.UPDATING
        };

        _context.Courses.Add(course);

        var tagEntities = await ResolveTagsAsync(tags);
        foreach (var tagEntity in tagEntities)
        {
            course.CourseTags.Add(new CourseTag { Course = course, Tag = tagEntity });
        }

        await _context.SaveChangesAsync();

        return course.CourseId;
    }

    public async Task<bool> UpdateCourseAsync(int courseId, int creatorId, string title, string? description, string? coverImageKey, AccessType accessType, string? passcode, CourseStatus? status, List<string> tags)
    {
        var course = await _context.Courses
            .Include(c => c.CourseTags)
                .ThenInclude(ct => ct.Tag)
            .FirstOrDefaultAsync(c => c.CourseId == courseId);

        if (course == null) return false;
        if (course.CreatorId != creatorId) throw new UnauthorizedAccessException("Bạn không có quyền chỉnh sửa khóa học này.");

        string? hashedPasscode = ResolvePasscodeHash(accessType, passcode, course.Passcode);

        course.Title = title;
        course.Description = description;
        course.CoverImage = coverImageKey;
        course.AccessType = accessType;
        course.Passcode = hashedPasscode;

        if (status.HasValue)
        {
            course.Status = status.Value;
        }

        course.UpdatedAt = DateTime.UtcNow;

        await SyncCourseTagsAsync(course, tags);

        await _context.SaveChangesAsync();

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

    public async Task<object> GetCoursesAsync(string scope, string? search, List<string>? tags, string? sort, string? status, string? accessType, int page, int pageSize, int? currentUserId)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? DefaultPageSize : Math.Min(pageSize, MaxPageSize);

        var query = _context.Courses
            .Include(c => c.Creator)
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
        // scope "public" (mặc định, dùng cho Home + Explore): KHÔNG lọc theo AccessType nữa.
        // Trước đây có `query = query.Where(c => c.AccessType == AccessType.PUBLIC)` ở đây,
        // nhưng theo yêu cầu mới, listing phải hiển thị TẤT CẢ khóa học (PUBLIC/PRIVATE/PROTECTED).
        // FE tự hiện icon khóa dựa vào field `accessType` đã có sẵn trong response bên dưới.
        // Việc chặn nội dung thật (PRIVATE/PROTECTED) vẫn được enforce ở GetCourseByIdAsync khi
        // user bấm vào xem chi tiết, nên không lộ dữ liệu nhạy cảm, chỉ lộ metadata (tên, ảnh bìa...).

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(c => c.Title.Contains(search) || c.Creator.FullName.Contains(search));
        }

        // #Tag-filter: lọc theo NHIỀU tag cùng lúc, kiểu OR — khóa học hiện ra nếu có
        // ÍT NHẤT 1 trong các tag được chọn. Tag lưu trong DB luôn ở dạng lowercase
        // (xem ResolveTagsAsync), nên chuẩn hóa cleanTags về lowercase trước khi so khớp.
        if (tags != null && tags.Count > 0)
        {
            var cleanTags = tags
                .Select(t => t.Trim().ToLower())
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Distinct()
                .ToList();

            if (cleanTags.Count > 0)
            {
                // MỚI: Lọc AND — Khóa học bắt buộc phải chứa TẤT CẢ các tag trong cleanTags
                foreach (var tag in cleanTags)
                {
                    var currentTag = tag; // Tạo biến cục bộ tránh lỗi closure
                    query = query.Where(c => c.CourseTags.Any(ct => ct.Tag.TagName == currentTag));
                }
            }
        }

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<CourseStatus>(status, true, out var statusEnum))
            query = query.Where(c => c.Status == statusEnum);

        if (!string.IsNullOrWhiteSpace(accessType) && Enum.TryParse<AccessType>(accessType, true, out var accessTypeEnum))
            query = query.Where(c => c.AccessType == accessTypeEnum);

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
                accessType = c.AccessType.ToString(),
                status = c.Status.ToString(),
                creator = new { userId = c.Creator.UserId, fullName = c.Creator.FullName, avatarUrl = c.Creator.AvatarUrl },
                tags = c.CourseTags.Select(ct => ct.Tag.TagName).ToList(),
                createdAt = c.CreatedAt,
                updatedAt = c.UpdatedAt,
                chapterCount = c.Chapters.Count,
                participantsCount = c.Enrollments.Count,
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

        if (course.AccessType == AccessType.PRIVATE && !isCreator && !isEnrolled)
        {
            throw new UnauthorizedAccessException("Khóa học này là riêng tư.");
        }

        if (course.AccessType == AccessType.PROTECTED && !isCreator)
        {
            if (string.IsNullOrEmpty(passcodeHeader) || string.IsNullOrEmpty(course.Passcode) || !BCrypt.Net.BCrypt.Verify(passcodeHeader, course.Passcode))
            {
                throw new UnauthorizedAccessException("PASSCODE_INVALID");
            }
        }

        int participantsCount = await _context.Enrollments.CountAsync(e => e.CourseId == courseId);
        int flashcardsCount = await _context.Blocks
            .CountAsync(b => b.Page.Chapter.CourseId == courseId && b.BlockType == "FLASHCARD");
        int quizzesCount = await _context.Blocks
            .CountAsync(b => b.Page.Chapter.CourseId == courseId && b.BlockType == "QUIZ");

        return new
        {
            courseId = course.CourseId,
            title = course.Title,
            description = course.Description,
            coverImage = course.CoverImage,
            accessType = course.AccessType.ToString(),
            status = course.Status.ToString(),
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
            updatedAt = course.UpdatedAt,
            participantsCount,
            chaptersCount = course.Chapters.Count,
            flashcardsCount,
            quizzesCount,
        };
    }

    private static string? ResolvePasscodeHash(AccessType accessType, string? newPasscode, string? existingPasscodeHash)
    {
        if (accessType != AccessType.PROTECTED)
        {
            return null;
        }

        if (!string.IsNullOrWhiteSpace(newPasscode))
        {
            return BCrypt.Net.BCrypt.HashPassword(newPasscode);
        }

        if (!string.IsNullOrWhiteSpace(existingPasscodeHash))
        {
            return existingPasscodeHash;
        }

        throw new PasscodeRequiredException();
    }

    private async Task SyncCourseTagsAsync(Course course, List<string>? tags)
    {
        var tagEntities = await ResolveTagsAsync(tags);
        var wantedNames = tagEntities.Select(t => t.TagName).ToHashSet();

        var toRemove = course.CourseTags.Where(ct => !wantedNames.Contains(ct.Tag.TagName)).ToList();
        foreach (var ct in toRemove)
        {
            course.CourseTags.Remove(ct);
        }

        var linkedNames = course.CourseTags.Select(ct => ct.Tag.TagName).ToHashSet();
        foreach (var tagEntity in tagEntities)
        {
            if (!linkedNames.Contains(tagEntity.TagName))
            {
                course.CourseTags.Add(new CourseTag { Course = course, Tag = tagEntity });
            }
        }
    }

    private async Task<List<Tag>> ResolveTagsAsync(List<string>? rawTags)
    {
        var cleanNames = (rawTags ?? new List<string>())
            .Select(t => t.Trim().ToLower())
            .Where(t => !string.IsNullOrWhiteSpace(t))
            .Distinct()
            .ToList();

        if (cleanNames.Count == 0) return new List<Tag>();

        var existingTags = await _context.Tags
            .Where(t => cleanNames.Contains(t.TagName))
            .ToListAsync();

        var existingNames = existingTags.Select(t => t.TagName).ToHashSet();
        var newTags = cleanNames
            .Where(n => !existingNames.Contains(n))
            .Select(n => new Tag { TagName = n })
            .ToList();

        if (newTags.Count > 0)
        {
            _context.Tags.AddRange(newTags);
        }

        return existingTags.Concat(newTags).ToList();
    }
}