import type {
  CourseDashboardStats,
  CourseInvitation,
} from '../types/course-detail.types';

/**
 * Mock data — dùng tạm để dựng UI trước khi backend sẵn sàng.
 * Thay 2 hàm bên dưới bằng axios call thật (shared/lib/axios.ts) khi API live.
 */

const MOCK_DELAY_MS = 800;

const MOCK_DASHBOARD_STATS: Record<string, CourseDashboardStats> = {
  '1': {
    participantsCount: 124,
    completedCount: 81,
    commentsCount: 45,
    students: [
      {
        userId: 1001,
        fullName: 'Hoàng Trần',
        avatarUrl: null,
        progressPercent: 80,
        enrolledAt: '2023-11-02T02:00:00.000Z',
      },
      {
        userId: 1002,
        fullName: 'Minh Lê',
        avatarUrl: null,
        progressPercent: 45,
        enrolledAt: '2023-11-05T02:00:00.000Z',
      },
      {
        userId: 1003,
        fullName: 'Thu Hà',
        avatarUrl: null,
        progressPercent: 92,
        enrolledAt: '2023-11-10T02:00:00.000Z',
      },
      {
        userId: 1004,
        fullName: 'Quang Huy',
        avatarUrl: null,
        progressPercent: 28,
        enrolledAt: '2023-11-12T02:00:00.000Z',
      },
      {
        userId: 1005,
        fullName: 'Bảo Ngọc',
        avatarUrl: null,
        progressPercent: 65,
        enrolledAt: '2023-11-15T02:00:00.000Z',
      },
    ],
  },
};

const MOCK_INVITATIONS: Record<string, CourseInvitation[]> = {
  '1': [
    {
      invitationId: 9001,
      courseId: 1,
      inviterId: 1,
      inviteeEmail: 'anh.nguyen@example.com',
      inviteeUserId: null,
      status: 'PENDING',
      createdAt: '2024-01-18T08:30:00.000Z',
      respondedAt: null,
    },
  ],
};

const DEFAULT_STATS: CourseDashboardStats = {
  participantsCount: 0,
  completedCount: 0,
  commentsCount: 0,
  students: [],
};

/** Mô phỏng GET /api/courses/{id}/dashboard */
export function getCourseDashboardStats(
  courseId: string,
): Promise<CourseDashboardStats> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_DASHBOARD_STATS[courseId] ?? MOCK_DASHBOARD_STATS['1'] ?? DEFAULT_STATS);
    }, MOCK_DELAY_MS);
  });
}

/** Mô phỏng GET /api/courses/{id}/invitations */
export function getCourseInvitations(
  courseId: string,
): Promise<CourseInvitation[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_INVITATIONS[courseId] ?? []);
    }, MOCK_DELAY_MS);
  });
}