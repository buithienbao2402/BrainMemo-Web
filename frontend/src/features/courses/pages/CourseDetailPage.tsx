// frontend/src/features/courses/pages/CourseDetailPage.tsx
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Grid, Stack, Loader, Alert, Center, Title, Text, Button } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { AboutSection } from '../components/AboutSection';
import { ChapterList } from '../components/ChapterList';
import { CommentSection } from '../components/CommentSection';
import { CourseHeader } from '../components/CourseHeader';
import { CourseInfoBox } from '../components/CourseInfoBox';
import { CourseOverviewCard } from '../components/CourseOverviewCard';
import { useCourseDetail } from '../hooks/useCourseDetail';
import { usePasscodeAccess, extractApiErrorMessage } from '@/shared/hooks/usePasscodeAccess';
import { PasscodeModal } from '@/shared/components/PasscodeModal';
import { useCourseProgress } from '../hooks/useCourseProgress';
import { useEnrollCourse } from '../hooks/useEnrollment';

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const courseId = Number(id);

  const { passcode, modalOpened, invalidAttempt, handleError, isPasscodeError, submitPasscode, closeModal } =
    usePasscodeAccess(courseId);

  const { data: course, isLoading, isError, error } = useCourseDetail(courseId, passcode);
  const { data: progress } = useCourseProgress(courseId);
  const { mutateAsync: enroll, isPending: isEnrolling } = useEnrollCourse(courseId);

  useEffect(() => {
    if (isError) handleError(error);
  }, [isError, error, handleError]);

  if (isLoading) return <Center h={300}><Loader color="orange" /></Center>;

  // 403 nhưng KHÔNG phải do passcode (vd PRIVATE) -> hiển thị thông báo lỗi thật từ BE
  if (isError && !isPasscodeError(error)) {
    return <Alert color="red">{extractApiErrorMessage(error, 'Không thể tải khóa học.')}</Alert>;
  }

  // CHẶN BẢO MẬT TUYỆT ĐỐI: Nếu dính lỗi passcode, khóa cứng UI, không cho render course bên dưới dù có cache
  if (isPasscodeError(error)) {
    return (
      <Stack align="center" mt={100} gap="md">
        <IconLock size={48} color="var(--mantine-color-orange-5)" />
        <Title order={3}>Khóa học được bảo vệ</Title>
        <Text c="dimmed">Khóa học này yêu cầu mật khẩu truy cập để xem nội dung.</Text>
        <Button color="orange" onClick={() => handleError(error)}>
          Nhập mật khẩu
        </Button>
        <PasscodeModal
          opened={modalOpened}
          onClose={closeModal}
          onSubmit={submitPasscode}
          isInvalid={invalidAttempt}
          title="Khóa học được bảo vệ"
        />
      </Stack>
    );
  }

  if (!course) {
    return <Center h={300}><Loader color="orange" /></Center>;
  }

  const sortedChapters = [...course.chapters].sort((a, b) => a.orderIndex - b.orderIndex);

  const handleStartLearning = async () => {
    const firstChapter = sortedChapters[0];
    if (!firstChapter) return;
    try {
      if (!progress?.isEnrolled) {
        await enroll(undefined);
      }
      navigate(`/courses/${course.id}/learn/${firstChapter.id}`);
    } catch {
      // Bỏ qua nếu lỗi
    }
  };

  const handleContinueLearning = () => {
    if (!progress?.currentChapterId) return;
    const path = progress.currentPageId
      ? `/courses/${course.id}/learn/${progress.currentChapterId}/${progress.currentPageId}`
      : `/courses/${course.id}/learn/${progress.currentChapterId}`;
    navigate(path);
  };

  const chaptersWithProgress = sortedChapters.map((ch) => ({
    ...ch,
    isCompleted: progress?.chapters.find((p) => p.chapterId === ch.id)?.isCompleted ?? false,
    isCurrent: ch.id === progress?.currentChapterId,
  }));

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
              progressPercent={progress?.progressPercent ?? 0}
              currentChapterOrderIndex={progress?.currentChapterOrderIndex ?? null}
              onStartLearning={handleStartLearning}
              onContinueLearning={handleContinueLearning}
              isStartingLearning={isEnrolling}
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
            <ChapterList chapters={chaptersWithProgress} />
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