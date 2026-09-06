import type { CourseComment } from '../types/course.types';

export const mockComments: CourseComment[] = [
  { id: 1, authorName: 'Nguyễn Văn A', content: 'Khóa học rất hay!', createdAt: new Date().toISOString() },
];