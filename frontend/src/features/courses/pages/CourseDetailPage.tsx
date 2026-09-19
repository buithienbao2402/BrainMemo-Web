// frontend/src/features/courses/pages/CourseDetailPage.tsx
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Grid, Stack, Loader, Alert, Center } from '@mantine/core';
import { AboutSection } from '../components/AboutSection';
import { ChapterList } from '../components/ChapterList';
import { CommentSection } from '../components/CommentSection';
import { CourseHeader } from '../components/CourseHeader';
import { CourseInfoBox } from '../components/CourseInfoBox';
import { CourseOverviewCard } from '../components/CourseOverviewCard';
import { useCourseDetail } from '../hooks/useCourseDetail';
import { usePasscodeAccess, extractApiErrorMessage } from '@/shared/hooks/usePasscodeAccess';
import { PasscodeModal } from '@/shared/components/PasscodeModal';

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const courseId = Number(id);

  // resetKey = courseId -> chuyển sang xem khóa học khác thì passcode cũ tự bị xóa
  const { passcode, modalOpened, invalidAttempt, handleError, isPasscodeError, submitPasscode, closeModal } =
    usePasscodeAccess(courseId);

  const { data: course, isLoading, isError, error } = useCourseDetail(courseId, passcode);

  useEffect(() => {
    if (isError) handleError(error);
  }, [isError, error, handleError]);

  if (isLoading) return <Center h={300}><Loader color="orange" /></Center>;

  // 403 nhưng KHÔNG phải do passcode (vd PRIVATE) -> hiển thị thông báo lỗi thật từ BE
  if (isError && !isPasscodeError(error)) {
    return <Alert color="red">{extractApiErrorMessage(error, 'Không thể tải khóa học.')}</Alert>;
  }

  if (!course) {
    // Đang chờ người dùng nhập passcode (PROTECTED) -> không render UI lỗi to đùng,
    // chỉ hiện loader mờ phía sau Modal.
    return (
      <>
        <Center h={300}><Loader color="orange" /></Center>
        <PasscodeModal
          opened={modalOpened}
          onClose={closeModal}
          onSubmit={submitPasscode}
          isInvalid={invalidAttempt}
          title="Khóa học được bảo vệ"
        />
      </>
    );
  }

  const handleStartLearning = () => {
    const firstChapter = [...course.chapters].sort((a, b) => a.orderIndex - b.orderIndex)[0];
    if (!firstChapter) return;
    navigate(`/courses/${course.id}/learn/${firstChapter.id}`);
  };

  return (
    <>
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
              progressPercent={0}
              currentChapterOrderIndex={null}
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

      <PasscodeModal
        opened={modalOpened}
        onClose={closeModal}
        onSubmit={submitPasscode}
        isInvalid={invalidAttempt}
        title="Khóa học được bảo vệ"
      />
    </>
  );
}