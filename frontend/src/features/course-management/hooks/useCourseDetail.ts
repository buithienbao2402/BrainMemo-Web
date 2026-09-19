import { useQuery } from '@tanstack/react-query';
// Import mock api — CHỈ còn dùng cho invitations (module Invitation backend chưa được xây, ngoài phạm vi đợt này)
import {
  getCourseDashboardStats,
  getCourseInvitations,
} from '../api/course-detail.mock.api';
// Import api thật
import {
  getCourseDashboardStatsReal,
  getCourseInvitationsReal,
  getCourseByIdReal,
} from '../api/course-detail.api';

// ==========================================
// CÔNG TẮC API: tách riêng 2 cờ vì Dashboard (participants/completed/comments) đã có
// backend thật (Phase 2), còn Invitation module thì chưa -> giữ mock để UI không vỡ.
const USE_MOCK_STATS = false;       // ĐỔI: false — dashboard đã có API thật
const USE_MOCK_INVITATIONS = true;  // Giữ nguyên cho tới khi có Invitation backend
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
    queryKey: courseDetailKeys.stats(courseId),
    queryFn: () =>
      USE_MOCK_STATS
        ? getCourseDashboardStats(courseId)
        : getCourseDashboardStatsReal(courseId),
    enabled: Boolean(courseId),
  });
}

/** GET /api/courses/{id}/invitations — danh sách lời mời đã gửi */
export function useCourseInvitations(courseId: string) {
  return useQuery({
    queryKey: courseDetailKeys.invitations(courseId),
    queryFn: () =>
      USE_MOCK_INVITATIONS
        ? getCourseInvitations(courseId)
        : getCourseInvitationsReal(courseId),
    enabled: Boolean(courseId),
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