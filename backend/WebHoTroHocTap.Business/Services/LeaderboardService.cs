using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using WebHoTroHocTap.Business.DTOs.Leaderboard;
using WebHoTroHocTap.DataAccess;

namespace WebHoTroHocTap.Business.Services;

public class LeaderboardService : ILeaderboardService
{
    private const int PointsPerEnrollment = 5;
    private const int PointsPerCompletedCourse = 100;
    private const int PointsPerCompletedPage = 10;
    private const int BonusPointsPerPassedQuizPage = 20;

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

    private sealed class Aggregate
    {
        public int Enrolled;
        public int CompletedCourses;
        public int CompletedPages;
        public int PassedQuizPages;

        public int Score =>
            Enrolled * PointsPerEnrollment
            + CompletedCourses * PointsPerCompletedCourse
            + CompletedPages * PointsPerCompletedPage
            + PassedQuizPages * BonusPointsPerPassedQuizPage;
    }

    public async Task<List<LeaderboardDto>> GetTopLearnersAsync(int limit)
    {
        limit = limit < 1 ? DefaultLimit : Math.Min(limit, MaxLimit);

        string cacheKey = $"leaderboard_top_{limit}";
        if (_cache.TryGetValue(cacheKey, out List<LeaderboardDto>? cached) && cached != null)
            return cached;

        // 1) Khóa học đã tham gia / đã hoàn thành theo từng user
        var enrollmentStats = await _context.Enrollments
            .GroupBy(e => e.UserId)
            .Select(g => new
            {
                UserId = g.Key,
                Enrolled = g.Count(),
                Completed = g.Count(e => e.Status == "COMPLETED")
            })
            .ToListAsync();

        // 2) Số trang đã hoàn thành theo từng user
        var completedPageStats = await _context.PageProgresses
            .Where(pp => pp.IsCompleted)
            .GroupBy(pp => pp.Enrollment.UserId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToListAsync();

        // 3) Số trang Quiz đã đạt (trang hoàn thành + có block QUIZ)
        var quizPageStats = await _context.PageProgresses
            .Where(pp => pp.IsCompleted && pp.Page.Blocks.Any(b => b.BlockType == "QUIZ"))
            .GroupBy(pp => pp.Enrollment.UserId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToListAsync();

        var map = new Dictionary<int, Aggregate>();
        Aggregate Get(int userId)
        {
            if (!map.TryGetValue(userId, out var agg))
            {
                agg = new Aggregate();
                map[userId] = agg;
            }
            return agg;
        }

        foreach (var s in enrollmentStats)
        {
            var a = Get(s.UserId);
            a.Enrolled = s.Enrolled;
            a.CompletedCourses = s.Completed;
        }
        foreach (var s in completedPageStats) Get(s.UserId).CompletedPages = s.Count;
        foreach (var s in quizPageStats) Get(s.UserId).PassedQuizPages = s.Count;

        // Sắp xếp giảm dần theo điểm; hòa điểm -> nhiều trang hoàn thành hơn -> userId nhỏ hơn (ổn định)
        var top = map
            .Select(kv => new { UserId = kv.Key, Agg = kv.Value, Score = kv.Value.Score })
            .Where(x => x.Score > 0)
            .OrderByDescending(x => x.Score)
            .ThenByDescending(x => x.Agg.CompletedPages)
            .ThenBy(x => x.UserId)
            .Take(limit)
            .ToList();

        var userIds = top.Select(x => x.UserId).ToList();
        var users = await _context.Users
            .Where(u => userIds.Contains(u.UserId))
            .Select(u => new { u.UserId, u.FullName, u.AvatarUrl })
            .ToDictionaryAsync(u => u.UserId);

        var result = new List<LeaderboardDto>();
        foreach (var x in top)
        {
            if (!users.TryGetValue(x.UserId, out var u)) continue;

            result.Add(new LeaderboardDto
            {
                Rank = result.Count + 1,
                UserId = u.UserId,
                FullName = u.FullName,
                AvatarUrl = u.AvatarUrl,
                TotalScore = x.Score,
                CompletedLessonsCount = x.Agg.CompletedPages,
                PassedQuizzesCount = x.Agg.PassedQuizPages,
                CompletedCoursesCount = x.Agg.CompletedCourses
            });
        }

        _cache.Set(cacheKey, result, CacheDuration);
        return result;
    }
}