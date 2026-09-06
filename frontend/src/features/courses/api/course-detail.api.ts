import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type { CourseDetail } from '../types/course.types';

// BE trả field "courseId" và "coverImage" -> map lại cho khớp CourseDetail
export async function fetchCourseDetail(courseId: number, passcode?: string): Promise<CourseDetail> {
    const { data } = await apiClient.get<ApiResponse<any>>(
        `/courses/${courseId}`,
        passcode ? { headers: { 'X-Access-Passcode': passcode } } : undefined
    );
    const raw = data.data;
    return {
        id: raw.courseId,
        title: raw.title,
        description: raw.description,
        coverImageUrl: raw.coverImage,
        creator: raw.creator,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        participantsCount: raw.participantsCount,
        chaptersCount: raw.chaptersCount,
        flashcardsCount: raw.flashcardsCount,
        quizzesCount: raw.quizzesCount,
        tags: raw.tags,
        status: raw.status,
        accessType: raw.accessType,
        chapters: raw.chapters,
    };
}