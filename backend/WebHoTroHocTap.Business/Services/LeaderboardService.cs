using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using WebHoTroHocTap.Business.DTOs.Leaderboard;
using WebHoTroHocTap.DataAccess;

namespace WebHoTroHocTap.Business.Services;

public class LeaderboardService : ILeaderboardService
{
    private const int DefaultLimit = 10;
    private const int MaxLimit = 50;
    private static readonly TimeSpan CacheDuration = TimeSpan.FromSeconds(60);

    private readonly AppDbContext _context;
    private readonly IMemoryCache _cache;

    public LeaderboardService(AppDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
    }

    private static int NormalizeLimit(int limit) =>
        limit < 1 ? DefaultLimit : Math.Min(limit, MaxLimit);

    // ------------------------------------------------------------------
    // Top khóa học: điểm = COUNT(enrollment) của khóa học.
    // Hòa điểm: khóa học tạo mới hơn trước, rồi course_id nhỏ hơn.
    // ------------------------------------------------------------------
    public async Task<List<TopCourseDto>> GetTopCoursesAsync(int limit)
    {
        limit = NormalizeLimit(limit);
        string cacheKey = $"leaderboard_courses_{limit}";
        if (_cache.TryGetValue(cacheKey, out List<TopCourseDto>? cached) && cached != null)
            return cached;

        var rows = await _context.Courses
            .Select(c => new
            {
                c.CourseId,
                c.Title,
                c.CoverImage,
                c.CreatedAt,
                CreatorName = c.Creator.FullName,
                Participants = c.Enrollments.Count
            })
            .Where(x => x.Participants > 0)
            .OrderByDescending(x => x.Participants)
            .ThenByDescending(x => x.CreatedAt)
            .ThenBy(x => x.CourseId)
            .Take(limit)
            .ToListAsync();

        var result = rows
            .Select((x, i) => new TopCourseDto
            {
                Rank = i + 1,
                CourseId = x.CourseId,
                Title = x.Title,
                CoverImage = x.CoverImage,
                CreatorName = x.CreatorName,
                ParticipantsCount = x.Participants
            })
            .ToList();

        _cache.Set(cacheKey, result, CacheDuration);
        return result;
    }

    // ------------------------------------------------------------------
    // Top creator: điểm = COUNT(DISTINCT enrollment.user_id) trên mọi khóa học
    // của creator (tính cả enrollment của chính creator, mọi accessType/status).
    // Hòa điểm: nhiều khóa học hơn trước, rồi user_id nhỏ hơn.
    // Tách thành các query đơn giản rồi ghép trong bộ nhớ để tránh các
    // câu lệnh GroupBy/SelectMany lồng nhau mà Pomelo dịch không ổn định.
    // ------------------------------------------------------------------
    public async Task<List<TopCreatorDto>> GetTopCreatorsAsync(int limit)
    {
        limit = NormalizeLimit(limit);
        string cacheKey = $"leaderboard_creators_{limit}";
        if (_cache.TryGetValue(cacheKey, out List<TopCreatorDto>? cached) && cached != null)
            return cached;

        var studentStats = await _context.Enrollments
            .GroupBy(e => e.Course.CreatorId)
            .Select(g => new
            {
                CreatorId = g.Key,
                Students = g.Select(e => e.UserId).Distinct().Count()
            })
            .ToListAsync();

        var courseStats = await _context.Courses
            .GroupBy(c => c.CreatorId)
            .Select(g => new { CreatorId = g.Key, Courses = g.Count() })
            .ToListAsync();
        var courseCountByCreator = courseStats.ToDictionary(x => x.CreatorId, x => x.Courses);

        var top = studentStats
            .Where(x => x.Students > 0)
            .Select(x => new
            {
                x.CreatorId,
                x.Students,
                Courses = courseCountByCreator.GetValueOrDefault(x.CreatorId)
            })
            .OrderByDescending(x => x.Students)
            .ThenByDescending(x => x.Courses)
            .ThenBy(x => x.CreatorId)
            .Take(limit)
            .ToList();

        var creatorIds = top.Select(x => x.CreatorId).ToList();
        var users = await _context.Users
            .Where(u => creatorIds.Contains(u.UserId))
            .Select(u => new { u.UserId, u.FullName, u.AvatarUrl })
            .ToDictionaryAsync(u => u.UserId);

        var result = new List<TopCreatorDto>();
        foreach (var x in top)
        {
            if (!users.TryGetValue(x.CreatorId, out var u)) continue;
            result.Add(new TopCreatorDto
            {
                Rank = result.Count + 1,
                UserId = u.UserId,
                FullName = u.FullName,
                AvatarUrl = u.AvatarUrl,
                StudentsCount = x.Students,
                CoursesCount = x.Courses
            });
        }

        _cache.Set(cacheKey, result, CacheDuration);
        return result;
    }
}