import { apiClient } from '@/shared/lib/axios';
import type { Chapter } from '../types/course-detail.types';

export const courseChaptersApi = {
  getCourseChapters: async (courseId: number, isDraft: boolean): Promise<Chapter[]> => {
    const response = await apiClient.get(`/courses/${courseId}/chapters`, {
      params: { isDraft },
    });
    const data = response.data.data;

    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      orderIndex: item.orderIndex,
      accessType: item.accessType,
      isDraft: item.isDraft,
      createdAt: item.createdAt ?? new Date().toISOString(),
    }));
  },

  deleteChapter: async (chapterId: number): Promise<void> => {
    await apiClient.delete(`/chapters/${chapterId}`);
  },
};