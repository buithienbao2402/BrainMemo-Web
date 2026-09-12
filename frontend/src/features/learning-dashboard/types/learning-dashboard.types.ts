export interface DashboardCourseCard {
  courseId: number;
  title: string;
  coverImage: string | null;
  progressPercent: number;
  currentChapterId: number | null;
  currentChapterOrderIndex: number | null;
  currentPageId: number | null;
}

export interface CreatedCourseCard {
  courseId: number;
  title: string;
  coverImage: string | null;
}

export interface LearningDashboardSummary {
  bio: string | null;
  totalActiveSeconds: number;
  chaptersReadCount: number;
  commentsCount: number;
  coursesCreatedCount: number;
  courses: {
    learning: DashboardCourseCard[];
    completed: DashboardCourseCard[];
    created: CreatedCourseCard[];
  };
}