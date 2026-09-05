export type AccessType = 'PUBLIC' | 'PRIVATE' | 'PROTECTED';

export type CourseStatus = 'PAUSED' | 'COMPLETED' | 'UPDATING';

export interface ChapterSummary {
  id: number;
  title: string;
  orderIndex: number;
  accessType: AccessType;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface CourseComment {
  id: number;
  authorName: string;
  authorAvatarUrl?: string;
  content: string;
  createdAt: string;
}

export interface CourseCreator {
  userId: number;
  fullName: string;
  avatarUrl?: string;
}

export interface CourseDetail {
  id: number;
  title: string;
  description: string;
  coverImageUrl: string;
  creator: CourseCreator;
  createdAt: string;
  updatedAt: string;
  participantsCount: number;
  chaptersCount: number;
  flashcardsCount: number;
  quizzesCount: number;
  tags: string[];
  progressPercent: number;
  status: CourseStatus;
  accessType: AccessType;
  currentChapterId: number | null;
  chapters: ChapterSummary[];
  comments: CourseComment[];
}
