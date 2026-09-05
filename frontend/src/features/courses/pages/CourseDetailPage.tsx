import { Grid, Stack } from '@mantine/core';
import { AboutSection } from '../components/AboutSection';
import { ChapterList } from '../components/ChapterList';
import { CommentSection } from '../components/CommentSection';
import { CourseHeader } from '../components/CourseHeader';
import { CourseInfoBox } from '../components/CourseInfoBox';
import { CourseOverviewCard } from '../components/CourseOverviewCard';
import { mockCourseDetail } from '../mock/mockCourseDetail';

export function CourseDetailPage() {
  const course = mockCourseDetail;
  const currentChapter = course.chapters.find((chapter) => chapter.id === course.currentChapterId);

  return (
    <Grid gutter="lg">
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Stack gap="lg">
          <CourseOverviewCard
            coverImageUrl={course.coverImageUrl}
            eyebrow="HỌC TRUYỆN • LẬP TRÌNH"
            title={course.title}
            chaptersCount={course.chaptersCount}
            flashcardsCount={course.flashcardsCount}
            quizzesCount={course.quizzesCount}
            tags={course.tags}
            progressPercent={course.progressPercent}
            currentChapterOrderIndex={currentChapter?.orderIndex ?? null}
          />
          <CourseInfoBox status={course.status} accessType={course.accessType} createdAt={course.createdAt} />
        </Stack>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 8 }}>
        <Stack gap="lg">
          <CourseHeader
            title={course.title}
            creatorName={course.creator.fullName}
            updatedAt={course.updatedAt}
            participantsCount={course.participantsCount}
          />
          <AboutSection description={course.description} />
          <ChapterList chapters={course.chapters} />
          <CommentSection comments={course.comments} />
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
