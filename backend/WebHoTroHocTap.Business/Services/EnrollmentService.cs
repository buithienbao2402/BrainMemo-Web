using Microsoft.EntityFrameworkCore;
using WebHoTroHocTap.DataAccess;
using WebHoTroHocTap.DataAccess.Entities;

namespace WebHoTroHocTap.Business.Services;

public class EnrollmentService : IEnrollmentService
{
    private readonly AppDbContext _context;
    public EnrollmentService(AppDbContext context) => _context = context;

    public async Task<int> EnrollAsync(int courseId, int userId, string? passcode)
    {
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == courseId);
        if (course == null) throw new KeyNotFoundException("Khóa học không tồn tại.");

        bool isCreator = course.CreatorId == userId;

        // Chỉ chặn passcode nếu KHÔNG phải Creator (Creator luôn được coi là đã "mở khóa").
        if (course.AccessType == DataAccess.Enums.AccessType.PROTECTED && !isCreator)
        {
            if (string.IsNullOrEmpty(passcode) || string.IsNullOrEmpty(course.Passcode)
                || !BCrypt.Net.BCrypt.Verify(passcode, course.Passcode))
            {
                throw new UnauthorizedAccessException("PASSCODE_INVALID");
            }
        }

        // Idempotent: nếu đã enroll rồi thì trả về luôn, không tạo trùng
        // (đã có unique constraint uq_enrollment_user_course chặn ở DB, nhưng check trước cho gọn).
        var existing = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId);
        if (existing != null) return existing.EnrollmentId;

        var enrollment = new Enrollment
        {
            UserId = userId,
            CourseId = courseId,
            Status = "LEARNING",
            ProgressPercent = 0
        };
        _context.Enrollments.Add(enrollment);
        await _context.SaveChangesAsync();

        return enrollment.EnrollmentId;
    }
}