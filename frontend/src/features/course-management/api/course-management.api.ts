import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { Course, CreateCoursePayload } from '../types/course-management.types';

export const courseManagementApi = {
  getMyCourses: async (page = 1, pageSize = 20): Promise<PaginatedResponse<Course>> => {
    // API Contract không cần /api ở đầu vì baseURL đã tự nối (xem axios.ts)
    const response = await apiClient.get('/courses', {
      params: { scope: 'owned', page, pageSize },
    });
    
    const data = response.data.data;
    
    return {
      ...data,
      items: data.items.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        coverImageUrl: item.cover_image_url ?? item.coverImageUrl,
        accessType: item.access_type ?? item.accessType,
        status: item.status,
        tags: item.tags || [],
        chapterCount: item.chapter_count ?? item.chapterCount,
        participantsCount: item.participants_count ?? item.participantsCount,
        updatedAt: item.updated_at ?? item.updatedAt,
      })),
    };
  },

  createCourse: async (payload: CreateCoursePayload): Promise<Course> => {
    const body = {
      title: payload.title,
      description: payload.description,
      cover_image_object_key: payload.coverImageObjectKey,
      access_type: payload.accessType,
      passcode: payload.passcode,
      tags: payload.tags,
    };

    const response = await apiClient.post('/courses', body);
    const item = response.data.data;

    return {
      id: item.id,
      title: item.title,
      description: item.description,
      coverImageUrl: item.cover_image_url ?? item.coverImageUrl,
      accessType: item.access_type ?? item.accessType,
      status: item.status,
      tags: item.tags || [],
      chapterCount: item.chapter_count ?? item.chapterCount,
      participantsCount: item.participants_count ?? item.participantsCount,
      updatedAt: item.updated_at ?? item.updatedAt,
    };
  },
};