import { apiClient } from '@/shared/lib/axios';
import type { Chapter } from '../types/course-detail.types';

export const courseChaptersApi = {
  getCourseChapters: async (courseId: number): Promise<Chapter[]> => {
    const response = await apiClient.get(`/courses/${courseId}/chapters`);
    const data = response.data.data;
    
    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      orderIndex: item.order_index ?? item.orderIndex,
      accessType: item.access_type ?? item.accessType,
      createdAt: item.created_at ?? item.createdAt ?? new Date().toISOString(),
    }));
  },

  deleteChapter: async (chapterId: number): Promise<void> => {
    await apiClient.delete(`/chapters/${chapterId}`);
  }
};