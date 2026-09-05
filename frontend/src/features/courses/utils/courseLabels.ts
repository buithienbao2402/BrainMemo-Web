import type { AccessType, CourseStatus } from '../types/course.types';

export const ACCESS_TYPE_LABEL: Record<AccessType, string> = {
  PUBLIC: 'Công khai',
  PRIVATE: 'Riêng tư',
  PROTECTED: 'Có mật khẩu',
};

export const COURSE_STATUS_LABEL: Record<CourseStatus, string> = {
  UPDATING: 'Đang cập nhật',
  PAUSED: 'Tạm dừng',
  COMPLETED: 'Đã hoàn thành',
};

export const COURSE_STATUS_COLOR: Record<CourseStatus, string> = {
  UPDATING: 'orange',
  PAUSED: 'gray',
  COMPLETED: 'teal',
};
