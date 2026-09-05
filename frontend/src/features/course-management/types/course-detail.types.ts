import type { CourseStatus } from './course-management.types';

/**
 * Types cho màn hình "Quản lý chi tiết khóa học" (Creator).
 */

/**
 * Một học viên trong danh sách trả về bởi dashboard.
 * Nguồn: GET /api/courses/{id}/dashboard -> data.students[]
 */
export interface CourseDashboardStudent {
  userId: number;
  fullName: string;
  avatarUrl: string | null;
  /** 0-100, không có điểm số — chỉ % tiến độ (theo ghi chú trong contract) */
  progressPercent: number;
  enrolledAt: string; // ISO datetime string
}

/**
 * GET /api/courses/{id}/dashboard — (Creator)
 * "{ participantsCount, completedCount, commentsCount, students: [...] }"
 */
export interface CourseDashboardStats {
  participantsCount: number;
  completedCount: number;
  commentsCount: number;
  students: CourseDashboardStudent[];
}

/** Bảng course_invitation.status (mục 1, thay đổi schema #2) */
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

/**
 * GET /api/courses/{id}/invitations — (Creator)
 * "Xem danh sách lời mời đã gửi + trạng thái"
 * Field theo schema bảng course_invitation (mục 1, #2), viết dạng camelCase.
 */
export interface CourseInvitation {
  invitationId: number;
  courseId: number;
  inviterId: number;
  inviteeEmail: string;
  inviteeUserId: number | null;
  status: InvitationStatus;
  createdAt: string; // ISO datetime string
  respondedAt: string | null;
}

export type AccessType = 'PUBLIC' | 'PRIVATE' | 'PROTECTED';

export interface Chapter {
  id: number;
  title: string;
  orderIndex: number;
  accessType: AccessType;
  createdAt: string;
}

/** GET /api/courses/{id} — dữ liệu đầy đủ 1 khóa học, dùng cho tab Tổng quan */
export interface CourseDetail {
  courseId: number;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  accessType: AccessType;
  status: CourseStatus;
  creator: {
    userId: number;
    fullName: string;
    avatarUrl: string | null;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}