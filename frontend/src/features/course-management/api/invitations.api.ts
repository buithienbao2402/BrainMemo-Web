import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type { CourseInvitation } from '../types/course-detail.types';

// 1. Lấy danh sách lời mời
export const getCourseInvitations = async (
    courseId: string | number
): Promise<CourseInvitation[]> => {
    // Sửa thành /courses/... (BỎ /api ở đầu)
    const response = await apiClient.get<ApiResponse<CourseInvitation[]>>(
        `/courses/${courseId}/invitations`
    );
    return response.data.data;
};

// 2. Gửi lời mời tới học viên
export const sendInvitation = async (
    courseId: string | number,
    emailOrUsername: string
): Promise<void> => {
    // Sửa thành /courses/... (BỎ /api ở đầu)
    await apiClient.post(`/courses/${courseId}/invitations`, {
        emailOrUsername,
    });
};

// 3. Thu hồi lời mời
export const revokeInvitation = async (
    courseId: string | number,
    invitationId: number
): Promise<void> => {
    // Sửa thành /courses/... (BỎ /api ở đầu)
    await apiClient.delete(`/courses/${courseId}/invitations/${invitationId}`);
};

// 4. Phản hồi lời mời
export const respondToInvitation = async (
    invitationId: number,
    accept: boolean
): Promise<void> => {
    await apiClient.post(`/invitations/${invitationId}/respond`, {
        accept,
    });
};