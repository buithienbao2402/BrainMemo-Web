import { useNavigate, useParams } from 'react-router-dom';
import { Grid, Stack, Loader, Alert, Center } from '@mantine/core';
import { AboutSection } from '../components/AboutSection';
import { ChapterList } from '../components/ChapterList';
import { CommentSection } from '../components/CommentSection';
import { CourseHeader } from '../components/CourseHeader';
import { CourseInfoBox } from '../components/CourseInfoBox';
import { CourseOverviewCard } from '../components/CourseOverviewCard';
import { useCourseDetail } from '../hooks/useCourseDetail';

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const courseId = Number(id);
  const { data: course, isLoading, isError, error } = useCourseDetail(courseId);

  if (isLoading) return <Center h={300}><Loader color="orange" /></Center>;

  if (isError) {
    return <Alert color="red">{(error as Error).message}</Alert>;
  }
  if (!course) return null;

  // Bug fix: nút "Bắt đầu học" trước đây không có handler (onStartLearning không được truyền)
  // -> click không làm gì. Nay lấy chương có orderIndex nhỏ nhất, điều hướng thẳng vào đó.
  // Không cần truyền pageId trên URL vì ChapterReadingPage tự lấy trang đầu tiên của chương
  // khi thiếu pageId (xem sortedPages[0]?.id trong ChapterReadingPage.tsx).
  const handleStartLearning = () => {
    const firstChapter = [...course.chapters].sort((a, b) => a.orderIndex - b.orderIndex)[0];
    if (!firstChapter) return; // khóa học chưa có chương nào
    navigate(`/courses/${course.id}/learn/${firstChapter.id}`);
  };

  return (
    <Grid styles={{ root: { '--grid-gutter': 'var(--mantine-spacing-lg)' } }}>
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Stack gap="lg">
          <CourseOverviewCard
            coverImageUrl={course.coverImageUrl}
            eyebrow={course.tags[0] ?? ''}
            title={course.title}
            chaptersCount={course.chaptersCount}
            flashcardsCount={course.flashcardsCount}
            quizzesCount={course.quizzesCount}
            tags={course.tags}
            progressPercent={0} // chưa có API tiến độ
            currentChapterOrderIndex={null} // chưa có API "tiếp tục học"
            onStartLearning={handleStartLearning}
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
          <CommentSection courseId={course.id} />
        </Stack>
      </Grid.Col>
    </Grid>
  );
}