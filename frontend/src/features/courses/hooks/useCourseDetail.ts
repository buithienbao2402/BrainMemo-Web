import { useQuery } from '@tanstack/react-query';
import { fetchCourseDetail } from '../api/course-detail.api';

export function useCourseDetail(courseId: number, passcode?: string) {
  return useQuery({
    queryKey: ['course-view-detail', courseId, passcode],
    queryFn: () => fetchCourseDetail(courseId, passcode),
    enabled: !!courseId,
    retry: false, // để bắt lỗi 403 passcode hiển thị ngay, không tự retry
  });
}