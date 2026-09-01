import { useQuery } from '@tanstack/react-query';
import {
  getCourseDashboardStats,
  getCourseInvitations,
} from '../api/course-detail.mock.api';

export const courseDetailKeys = {
  all: ['course-detail'] as const,
  stats: (courseId: string) => [...courseDetailKeys.all, 'stats', courseId] as const,
  invitations: (courseId: string) =>
    [...courseDetailKeys.all, 'invitations', courseId] as const,
};

/** GET /api/courses/{id}/dashboard — thống kê + danh sách học viên */
export function useCourseDashboardStats(courseId: string) {
  return useQuery({
    queryKey: courseDetailKeys.stats(courseId),
    queryFn: () => getCourseDashboardStats(courseId),
    enabled: Boolean(courseId),
  });
}

/** GET /api/courses/{id}/invitations — danh sách lời mời đã gửi */
export function useCourseInvitations(courseId: string) {
  return useQuery({
    queryKey: courseDetailKeys.invitations(courseId),
    queryFn: () => getCourseInvitations(courseId),
    enabled: Boolean(courseId),
  });
}