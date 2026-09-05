import { apiClient } from '@/shared/lib/axios';
import type { CourseDashboardStats, CourseInvitation, CourseDetail  } from '../types/course-detail.types';

export async function getCourseDashboardStatsReal(courseId: string): Promise<CourseDashboardStats> {
  const response = await apiClient.get(`/courses/${courseId}/dashboard`);
  const data = response.data.data;

  return {
    participantsCount: data.participants_count ?? data.participantsCount,
    completedCount: data.completed_count ?? data.completedCount,
    commentsCount: data.comments_count ?? data.commentsCount,
    students: data.students?.map((s: any) => ({
      userId: s.user_id ?? s.userId,
      fullName: s.full_name ?? s.fullName,
      avatarUrl: s.avatar_url ?? s.avatarUrl,
      progressPercent: s.progress_percent ?? s.progressPercent,
      enrolledAt: s.enrolled_at ?? s.enrolledAt,
    })) || [],
  };
}

export async function getCourseInvitationsReal(courseId: string): Promise<CourseInvitation[]> {
  const response = await apiClient.get(`/courses/${courseId}/invitations`);
  const data = response.data.data;

  return data.map((inv: any) => ({
    invitationId: inv.invitation_id ?? inv.invitationId,
    courseId: inv.course_id ?? inv.courseId,
    inviterId: inv.inviter_id ?? inv.inviterId,
    inviteeEmail: inv.invitee_email ?? inv.inviteeEmail,
    inviteeUserId: inv.invitee_user_id ?? inv.inviteeUserId,
    status: inv.status,
    createdAt: inv.created_at ?? inv.createdAt,
    respondedAt: inv.responded_at ?? inv.respondedAt,
  }));
}

export async function getCourseByIdReal(courseId: string): Promise<CourseDetail> {
  const response = await apiClient.get(`/courses/${courseId}`);
  const data = response.data.data;

  return {
    courseId: data.courseId ?? data.course_id,
    title: data.title,
    description: data.description ?? null,
    // BE hiện trả "coverImage" (object key thô, chưa resolve qua Minio) —
    // giữ fallback này để không vỡ khi BE đổi tên field sau khi làm xong MinioUrlResolver.
    coverImageUrl: data.coverImageUrl ?? data.coverImage ?? null,
    accessType: data.accessType ?? data.access_type,
    status: data.status,
    creator: {
      userId: data.creator?.userId ?? data.creator?.user_id,
      fullName: data.creator?.fullName ?? data.creator?.full_name,
      avatarUrl: data.creator?.avatarUrl ?? data.creator?.avatar_url ?? null,
    },
    tags: data.tags ?? [],
    createdAt: data.createdAt ?? data.created_at,
    updatedAt: data.updatedAt ?? data.updated_at,
  };
}