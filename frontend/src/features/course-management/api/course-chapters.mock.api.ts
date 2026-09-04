import type { Chapter } from '../types/course-detail.types';

const MOCK_DELAY_MS = 600;

function delay<T>(value: T, ms = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

let mockChapters: Chapter[] = [
  { id: 1, title: 'Giới thiệu tổng quan & Cài đặt môi trường', orderIndex: 1, accessType: 'PUBLIC', createdAt: '2023-10-15T00:00:00.000Z' },
  { id: 2, title: 'Biến & Kiểu Dữ Liệu', orderIndex: 2, accessType: 'PUBLIC', createdAt: '2023-10-18T00:00:00.000Z' },
  { id: 3, title: 'Cấu trúc điều khiển (If/Else, Switch)', orderIndex: 3, accessType: 'PRIVATE', createdAt: '2023-10-20T00:00:00.000Z' },
  { id: 4, title: 'Vòng lặp (For, While, Do-While)', orderIndex: 4, accessType: 'PROTECTED', createdAt: '2023-10-22T00:00:00.000Z' },
];

export const courseChaptersMockApi = {
  getCourseChapters: async (courseId: number): Promise<Chapter[]> => {
    void courseId; 
    return delay([...mockChapters].sort((a, b) => a.orderIndex - b.orderIndex));
  },
  deleteChapter: async (chapterId: number): Promise<void> => {
    mockChapters = mockChapters.filter((c) => c.id !== chapterId);
    return delay(undefined);
  }
};