import { apiClient } from '@/shared/lib/axios';
import type { CourseDashboardStats, CourseInvitation } from '../types/course-detail.types';

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