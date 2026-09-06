export interface CourseListItem {
  courseId: number;
  title: string;
  description: string | null;
  coverImage: string | null;
  accessType: 'PUBLIC' | 'PRIVATE' | 'PROTECTED';
  status: 'PAUSED' | 'COMPLETED' | 'UPDATING';
  creator: { userId: number; fullName: string; avatarUrl?: string | null };
  tags: string[];
  createdAt: string;
  updatedAt: string;
  chapterCount: number;
  participantsCount: number;
}

export interface CourseListResponse {
  items: CourseListItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export type SortOption = 'updated' | 'newest' | 'participants' | 'comments';
export type StatusFilter = '' | 'COMPLETED' | 'UPDATING' | 'PAUSED';
export type AccessTypeFilter = '' | 'PUBLIC' | 'PRIVATE' | 'PROTECTED';

export interface ExploreFilters {
  search: string;
  sort: SortOption;
  status: StatusFilter;
  accessType: AccessTypeFilter;
  tag: string;
  page: number;
}