import { useQuery } from '@tanstack/react-query';
// Import mock api (GỐC)
import {
  getCourseDashboardStats,
  getCourseInvitations,
} from '../api/course-detail.mock.api';
// Import api thật (MỚI THÊM)
import {
  getCourseDashboardStatsReal,
  getCourseInvitationsReal,
  getCourseByIdReal,
} from '../api/course-detail.api';

// ==========================================
// CÔNG TẮC API: True = Chạy code gốc của ông, False = Gọi Backend
const USE_MOCK = true;
// ==========================================

export const courseDetailKeys = {
  all: ['course-detail'] as const,
  stats: (courseId: string) => [...courseDetailKeys.all, 'stats', courseId] as const,
  invitations: (courseId: string) =>
    [...courseDetailKeys.all, 'invitations', courseId] as const,
  detail: (courseId: string) => [...courseDetailKeys.all, 'info', courseId] as const,
};

/** GET /api/courses/{id}/dashboard — thống kê + danh sách học viên */
export function useCourseDashboardStats(courseId: string) {
  return useQuery({
    queryKey: courseDetailKeys.stats(courseId), // Giữ nguyên gốc
    queryFn: () => 
      USE_MOCK 
        ? getCourseDashboardStats(courseId) // Đúng y như gốc
        : getCourseDashboardStatsReal(courseId), // Đường phụ cho BE
    enabled: Boolean(courseId), // Giữ nguyên gốc
  });
}

/** GET /api/courses/{id}/invitations — danh sách lời mời đã gửi */
export function useCourseInvitations(courseId: string) {
  return useQuery({
    queryKey: courseDetailKeys.invitations(courseId), // Giữ nguyên gốc
    queryFn: () => 
      USE_MOCK 
        ? getCourseInvitations(courseId) // Đúng y như gốc
        : getCourseInvitationsReal(courseId), // Đường phụ cho BE
    enabled: Boolean(courseId), // Giữ nguyên gốc
  });
}

/** GET /api/courses/{id} — thông tin đầy đủ khóa học (không mock, luôn gọi API thật) */
export function useCourseDetail(courseId: string) {
  return useQuery({
    queryKey: courseDetailKeys.detail(courseId),
    queryFn: () => getCourseByIdReal(courseId),
    enabled: Boolean(courseId),
  });
}