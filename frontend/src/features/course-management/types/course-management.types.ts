export type AccessType = 'PUBLIC' | 'PRIVATE' | 'PROTECTED';
export type CourseStatus = 'PAUSED' | 'COMPLETED' | 'UPDATING';

export interface Course {
  id: number;
  title: string;
  description: string;
  coverImageUrl: string | null;
  accessType: AccessType;
  status: CourseStatus;
  tags: string[];
  chapterCount: number;
  participantsCount: number;
  updatedAt: string;
}

export interface CreateCoursePayload {
  title: string;
  description: string;
  coverImageObjectKey: string;
  accessType: AccessType;
  status?: CourseStatus;
  passcode?: string;
  tags: string[];
}