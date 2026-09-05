using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebHoTroHocTap.Business.DTOs.Home;

public class HomeDashboardDto
{
    public object? RecentLearning { get; set; } // Khóa học đang học gần đây nhất
    public object EnrolledCourses { get; set; } = new List<object>(); // Danh sách đang học
    public object FeaturedCourses { get; set; } = new List<object>(); // Khóa học nổi bật/mới
    public List<string> PopularTags { get; set; } = new(); // Danh sách tag gợi ý
    public UserQuickStatsDto Stats { get; set; } = new();
}

public class UserQuickStatsDto
{
    public int TotalEnrolled { get; set; }
    public int TotalCreated { get; set; }
    public int CompletedCourses { get; set; }
}
