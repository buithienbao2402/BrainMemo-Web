import type { PaginatedResponse } from '@/shared/types/api.types';
import type { Course, CreateCoursePayload } from '../types/course-management.types';

const MOCK_DELAY_MS = 800;

function delay<T>(value: T, ms = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const MOCK_COURSES: Course[] = [
  {
    id: 1,
    title: 'Nhập Môn Python - Từ Zero tới Hero',
    description: 'Khóa học lập trình Python cho người mới bắt đầu.',
    coverImageUrl: null,
    accessType: 'PUBLIC',
    status: 'UPDATING',
    tags: ['Python', 'Lập trình'],
    chapterCount: 12,
    participantsCount: 452000,
    updatedAt: '2026-08-20T09:00:00.000Z',
  },
  {
    id: 2,
    title: 'Giải Tích 1: Đạo Hàm Như Truyện Tranh',
    description: 'Giải tích trực quan qua hình ảnh và ví dụ đời thường.',
    coverImageUrl: null,
    accessType: 'PUBLIC',
    status: 'COMPLETED',
    tags: ['Toán', 'Giải tích'],
    chapterCount: 10,
    participantsCount: 321000,
    updatedAt: '2026-07-15T09:00:00.000Z',
  },
  {
    id: 3,
    title: 'Tiếng Anh Giao Tiếp - Level Up Mỗi Ngày',
    description: 'Luyện phản xạ giao tiếp tiếng Anh hàng ngày.',
    coverImageUrl: null,
    accessType: 'PUBLIC',
    status: 'UPDATING',
    tags: ['Tiếng Anh', 'Giao tiếp'],
    chapterCount: 15,
    participantsCount: 512000,
    updatedAt: '2026-08-25T09:00:00.000Z',
  },
  {
    id: 4,
    title: 'Vật Lý Lượng Tử Bằng Hình Ảnh',
    description: 'Vật lý lượng tử được trực quan hóa dễ hiểu.',
    coverImageUrl: null,
    accessType: 'PRIVATE',
    status: 'UPDATING',
    tags: ['Vật lý'],
    chapterCount: 9,
    participantsCount: 198000,
    updatedAt: '2026-08-10T09:00:00.000Z',
  },
  {
    id: 5,
    title: 'Tư Duy Phản Biện - Đọc Vị Mọi Lập Luận',
    description: 'Rèn tư duy phản biện qua các tình huống thực tế.',
    coverImageUrl: null,
    accessType: 'PUBLIC',
    status: 'COMPLETED',
    tags: ['Tư duy', 'Kỹ năng mềm'],
    chapterCount: 8,
    participantsCount: 267000,
    updatedAt: '2026-06-30T09:00:00.000Z',
  },
  {
    id: 6,
    title: 'JavaScript - Từ Meme tới Master',
    description: 'Học JavaScript qua các ví dụ hài hước, dễ nhớ.',
    coverImageUrl: null,
    accessType: 'PUBLIC',
    status: 'UPDATING',
    tags: ['JavaScript', 'Lập trình'],
    chapterCount: 11,
    participantsCount: 398000,
    updatedAt: '2026-08-28T09:00:00.000Z',
  },
];

// Mock: tổng thực tế của creator (12) > số item mẫu đang có, giả lập còn dữ liệu ở trang sau.
let mockTotalItems = 12;

export const courseManagementMockApi = {
  getMyCourses: async (page = 1, pageSize = 20): Promise<PaginatedResponse<Course>> => {
    const items = MOCK_COURSES.slice((page - 1) * pageSize, page * pageSize);
    return delay({
      items,
      page,
      pageSize,
      totalItems: mockTotalItems,
      totalPages: Math.ceil(mockTotalItems / pageSize),
    });
  },

  createCourse: async (payload: CreateCoursePayload): Promise<Course> => {
    console.log('[MOCK] createCourse payload:', payload);

    const newCourse: Course = {
      id: MOCK_COURSES.length + 1,
      title: payload.title,
      description: payload.description,
      coverImageUrl: null,
      accessType: payload.accessType,
      status: 'UPDATING',
      tags: payload.tags,
      chapterCount: 0,
      participantsCount: 0,
      updatedAt: new Date().toISOString(),
    };

    MOCK_COURSES.unshift(newCourse);
    mockTotalItems += 1;

    return delay(newCourse);
  },
};