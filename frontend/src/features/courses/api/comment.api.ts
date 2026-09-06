import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type { CourseComment } from '../types/course.types';

interface CommentListResponse { items: CourseComment[]; page: number; pageSize: number; totalItems: number; totalPages: number; }

export async function fetchComments(courseId: number, page = 1) {
  const { data } = await apiClient.get<ApiResponse<CommentListResponse>>(`/courses/${courseId}/comments`, { params: { page, pageSize: 20 } });
  return data.data;
}
export async function postComment(courseId: number, content: string) {
  const { data } = await apiClient.post<ApiResponse<CourseComment>>(`/courses/${courseId}/comments`, { content });
  return data.data;
}
export async function updateComment(commentId: number, content: string) {
  const { data } = await apiClient.put<ApiResponse<CourseComment>>(`/comments/${commentId}`, { content });
  return data.data;
}
export async function deleteComment(commentId: number) {
  await apiClient.delete(`/comments/${commentId}`);
}