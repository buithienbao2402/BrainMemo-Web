using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebHoTroHocTap.Business.DTOs.Home;
using WebHoTroHocTap.DataAccess;
using WebHoTroHocTap.DataAccess.Enums;

namespace WebHoTroHocTap.Business.Services;

public class HomeService : IHomeService
{
    private readonly AppDbContext _context;

    public HomeService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<HomeDashboardDto> GetHomeDashboardAsync(int? userId)
    {
        var response = new HomeDashboardDto();

        // 1. Lấy danh sách tag phổ biến nhất
        response.PopularTags = await GetPopularTagsAsync(10);

        // 2. Khóa học nổi bật / mới nhất trên hệ thống (PUBLIC)
        response.FeaturedCourses = await _context.Courses
            .Where(c => c.AccessType == AccessType.PUBLIC)
            .OrderByDescending(c => c.Enrollments.Count)
            .ThenByDescending(c => c.CreatedAt)
            .Take(6)
            .Select(c => new
            {
                c.CourseId,
                c.Title,
                c.Description,
                c.CoverImage,
                c.AccessType,
                Creator = new { c.Creator.UserId, c.Creator.FullName, c.Creator.AvatarUrl },
                Tags = c.CourseTags.Select(ct => ct.Tag.TagName).ToList(),
                TotalParticipants = c.Enrollments.Count,
                c.CreatedAt
            })
            .ToListAsync();

        // 3. Nếu user đã đăng nhập -> Lấy khóa học đang học gần đây + Thống kê nhanh
        if (userId.HasValue)
        {
            var userEnrollments = await _context.Enrollments
                .Include(e => e.Course)
                    .ThenInclude(c => c.Creator)
                .Include(e => e.Course.CourseTags)
                    .ThenInclude(ct => ct.Tag)
                .Where(e => e.UserId == userId.Value)
                .OrderByDescending(e => e.LastAccessedAt ?? e.EnrolledAt)
                .ToListAsync();

            response.EnrolledCourses = userEnrollments.Take(4).Select(e => new
            {
                e.CourseId,
                e.Course.Title,
                e.Course.CoverImage,
                e.ProgressPercent,
                e.Status,
                e.LastAccessedAt,
                Creator = new { e.Course.Creator.UserId, e.Course.Creator.FullName, e.Course.Creator.AvatarUrl }
            }).ToList();

            // Khóa học vừa học gần đây nhất
            response.RecentLearning = userEnrollments.FirstOrDefault() != null ? new
            {
                userEnrollments.First().CourseId,
                userEnrollments.First().Course.Title,
                userEnrollments.First().ProgressPercent,
                userEnrollments.First().LastAccessedAt,
                userEnrollments.First().LastPageId
            } : null;

            // Thống kê nhanh
            response.Stats = new UserQuickStatsDto
            {
                TotalEnrolled = userEnrollments.Count,
                TotalCreated = await _context.Courses.CountAsync(c => c.CreatorId == userId.Value),
                CompletedCourses = userEnrollments.Count(e => e.Status == "COMPLETED")
            };
        }

        return response;
    }

    public async Task<List<string>> GetPopularTagsAsync(int limit = 15)
    {
        return await _context.CourseTags
            .GroupBy(ct => ct.Tag.TagName)
            .OrderByDescending(g => g.Count())
            .Select(g => g.Key)
            .Take(limit)
            .ToListAsync();
    }
}
