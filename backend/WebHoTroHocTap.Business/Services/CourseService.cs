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
        // #1: nếu PROTECTED mà không có passcode nào -> ném lỗi ngay, không cho lọt xuống DB
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

        // #6: resolve tag 1 lần bằng 1 query, không loop query từng cái
        var tagEntities = await ResolveTagsAsync(tags);
        foreach (var tagEntity in tagEntities)
        {
            course.CourseTags.Add(new CourseTag { Course = course, Tag = tagEntity });
        }

        // #6: 1 lần SaveChanges duy nhất cho course + tag mới + liên kết course_tag
        // => EF Core gom tất cả vào 1 transaction ngầm, atomic thật sự.
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

        // #1: giữ passcode cũ nếu không đổi, ném lỗi nếu chuyển sang PROTECTED mà không có passcode nào cả
        string? hashedPasscode = ResolvePasscodeHash(accessType, passcode, course.Passcode);

        course.Title = title;
        course.Description = description;
        course.CoverImage = coverImageKey;
        course.AccessType = accessType;
        course.Passcode = hashedPasscode;

        // #8: chỉ đổi status nếu client thực sự gửi lên
        if (status.HasValue)
        {
            course.Status = status.Value;
        }

        course.UpdatedAt = DateTime.UtcNow;

        await SyncCourseTagsAsync(course, tags);

        // #6: 1 lần SaveChanges duy nhất cho toàn bộ thay đổi ở trên
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

    public async Task<object> GetCoursesAsync(string scope, string? search, string? tag, string? sort, int page, int pageSize, int? currentUserId)
    {
        // #11: chặn page/pageSize không hợp lệ trước khi query
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? DefaultPageSize : Math.Min(pageSize, MaxPageSize);

        var query = _context.Courses
            .Include(c => c.Creator)
            .Include(c => c.CourseTags)
                .ThenInclude(ct => ct.Tag)
            // #7: bỏ .Include(c => c.Enrollments) và .Include(c => c.Comments)
            // Count() bên dưới vẫn dịch đúng thành COUNT(*) subquery, không cần tải cả bảng.
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
            query = query.Where(c => c.AccessType == AccessType.PUBLIC);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(c => c.Title.Contains(search) || c.Creator.FullName.Contains(search));
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
                accessType = ch.AccessType // Chapter chưa đổi sang enum, để nguyên như bản gốc
            }).ToList(),
            createdAt = course.CreatedAt,
            updatedAt = course.UpdatedAt
        };
    }

    /// <summary>
    /// #1: Xác định passcode hash cuối cùng dựa trên accessType.
    /// - Không phải PROTECTED -> luôn null (xóa passcode cũ nếu có, ví dụ chuyển PROTECTED -> PUBLIC).
    /// - PROTECTED + có passcode mới -> hash lại bằng BCrypt.
    /// - PROTECTED + không gửi passcode mới nhưng đã có hash cũ -> giữ nguyên (trường hợp Update không đổi passcode).
    /// - PROTECTED + không có passcode nào cả (mới lẫn cũ) -> ném PasscodeRequiredException,
    ///   chặn đứng trước khi chạm DB (init_db.sql có CHECK constraint chk_course_passcode).
    /// </summary>
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

    /// <summary>
    /// #6: Đồng bộ tag cho course ĐÃ TỒN TẠI, thao tác hoàn toàn trong bộ nhớ (navigation collection).
    /// KHÔNG gọi SaveChanges ở đây -> gộp chung vào 1 lần SaveChanges duy nhất ở UpdateCourseAsync.
    /// </summary>
    private async Task SyncCourseTagsAsync(Course course, List<string>? tags)
    {
        var tagEntities = await ResolveTagsAsync(tags);
        var wantedNames = tagEntities.Select(t => t.TagName).ToHashSet();

        // Bỏ liên kết những tag không còn trong danh sách mới
        var toRemove = course.CourseTags.Where(ct => !wantedNames.Contains(ct.Tag.TagName)).ToList();
        foreach (var ct in toRemove)
        {
            course.CourseTags.Remove(ct);
        }

        // Thêm liên kết cho tag mới (bỏ qua tag đã có sẵn liên kết từ trước)
        var linkedNames = course.CourseTags.Select(ct => ct.Tag.TagName).ToHashSet();
        foreach (var tagEntity in tagEntities)
        {
            if (!linkedNames.Contains(tagEntity.TagName))
            {
                course.CourseTags.Add(new CourseTag { Course = course, Tag = tagEntity });
            }
        }
    }

    /// <summary>
    /// #6: Tra cứu tag đã tồn tại bằng 1 query duy nhất (thay vì query từng cái trong loop).
    /// Tag chưa có thì tạo entity mới, CHƯA SaveChanges (sẽ được lưu cùng lượt SaveChanges của tầng gọi).
    /// </summary>
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