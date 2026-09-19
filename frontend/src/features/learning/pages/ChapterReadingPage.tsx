// frontend/src/features/learning/pages/ChapterReadingPage.tsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Center, Loader, Alert } from '@mantine/core';
import { ReadingLayout } from '@/app/layouts/ReadingLayout';
import { useChapterDetail } from '../hooks/useChapterDetail';
import { usePageDetail } from '../hooks/usePageDetail';
import { useChapterProgress } from '../hooks/useProgress';
import { useCourseDetail } from '@/features/courses/hooks/useCourseDetail';
import { ContentRenderer } from '../components/ContentRenderer';
import { usePasscodeAccess, extractApiErrorMessage } from '@/shared/hooks/usePasscodeAccess';
import { PasscodeModal } from '@/shared/components/PasscodeModal';

export function ChapterReadingPage() {
  const { courseId, chapterId, pageId } = useParams<{
    courseId: string;
    chapterId: string;
    pageId?: string;
  }>();
  const navigate = useNavigate();

  // resetKey = chapterId -> chuyển sang chương khác (kể cả PROTECTED khác mật khẩu) thì tự reset,
  // nhưng chuyển trang (pageId) trong CÙNG chương vẫn giữ nguyên passcode đã nhập — đúng tinh thần
  // "Page kế thừa passcode của Chapter chứa nó".
  const { passcode, modalOpened, invalidAttempt, handleError, isPasscodeError, submitPasscode, closeModal } =
    usePasscodeAccess(chapterId);

  const { data: chapter, isLoading: loadingChapter, isError: chapterHasError, error: chapterErrObj } =
    useChapterDetail(Number(chapterId), passcode);
  const { data: course } = useCourseDetail(Number(courseId));
  const { data: chapterProgress } = useChapterProgress(Number(chapterId));

  const sortedPages = chapter ? [...chapter.pages].sort((a, b) => a.orderIndex - b.orderIndex) : [];
  const activePageId = pageId ? Number(pageId) : sortedPages[0]?.id;

  // Gửi CÙNG passcode đã mở khóa chương cho request lấy trang, vì hệ thống không lưu trạng thái
  // đã mở khóa -> mọi request nội dung PROTECTED đều phải kèm header ở mọi lần gọi (API_Contract.md mục 0).
  const { data: page, isLoading: loadingPage, isError: pageHasError, error: pageErrObj } =
    usePageDetail(activePageId, passcode);

  const sortedChapters = course ? [...course.chapters].sort((a, b) => a.orderIndex - b.orderIndex) : [];
  const currentChapterIndex = sortedChapters.findIndex((c) => c.id === Number(chapterId));
  const prevChapter = currentChapterIndex > 0 ? sortedChapters[currentChapterIndex - 1] : null;
  const nextChapter =
    currentChapterIndex >= 0 && currentChapterIndex < sortedChapters.length - 1
      ? sortedChapters[currentChapterIndex + 1]
      : null;

  const goToChapter = (id: number) => navigate(`/courses/${courseId}/learn/${id}`);

  useEffect(() => {
    if (chapterHasError) handleError(chapterErrObj);
  }, [chapterHasError, chapterErrObj, handleError]);

  useEffect(() => {
    if (pageHasError) handleError(pageErrObj);
  }, [pageHasError, pageErrObj, handleError]);

  if (loadingChapter) return <Center h={300}><Loader color="orange" /></Center>;

  // 403 nhưng KHÔNG phải do passcode (vd chương PRIVATE) -> hiển thị lỗi thật, không mở modal
  if (chapterHasError && !isPasscodeError(chapterErrObj)) {
    return <Alert color="red">{extractApiErrorMessage(chapterErrObj, 'Không thể tải chương.')}</Alert>;
  }

  if (!chapter) {
    // Đang chờ nhập passcode cho chương PROTECTED
    return (
      <>
        <Center h={300}><Loader color="orange" /></Center>
        <PasscodeModal
          opened={modalOpened}
          onClose={closeModal}
          onSubmit={submitPasscode}
          isInvalid={invalidAttempt}
          title="Chương học được bảo vệ"
        />
      </>
    );
  }

  const currentIndex = sortedPages.findIndex((p) => p.id === activePageId);
  const totalPages = sortedPages.length;

  const goToPage = (id: number) => navigate(`/courses/${courseId}/learn/${chapterId}/${id}`);

  const tocPages = sortedPages.map((p) => ({
    id: p.id,
    title: p.title,
    orderIndex: p.orderIndex,
    isLocked: false,
  }));

  return (
    <>
      <ReadingLayout
        courseTitle={course?.title ?? ''}
        chapterTitle={chapter.title}
        progressPercent={chapterProgress?.progressPercent ?? 0}
        currentPageIndex={currentIndex + 1}
        totalPages={totalPages}
        isPrevDisabled={currentIndex <= 0}
        isNextDisabled={currentIndex >= totalPages - 1}
        onBack={() => navigate(`/courses/${courseId}`)}
        onPrev={() => sortedPages[currentIndex - 1] && goToPage(sortedPages[currentIndex - 1].id)}
        onNext={() => sortedPages[currentIndex + 1] && goToPage(sortedPages[currentIndex + 1].id)}
        onPrevChapter={prevChapter ? () => goToChapter(prevChapter.id) : undefined}
        onNextChapter={nextChapter ? () => goToChapter(nextChapter.id) : undefined}
        isPrevChapterDisabled={!prevChapter}
        isNextChapterDisabled={!nextChapter}
        tocPages={tocPages}
        currentPageId={activePageId}
        onNavigateToPage={goToPage}
      >
        {loadingPage || !page ? (
          pageHasError && !isPasscodeError(pageErrObj) ? (
            <Alert color="red">{extractApiErrorMessage(pageErrObj, 'Không thể tải nội dung trang.')}</Alert>
          ) : (
            <Center h={200}><Loader color="orange" /></Center>
          )
        ) : (
          <ContentRenderer blocks={page.blocks} pageId={page.id} chapterId={Number(chapterId)} />
        )}
      </ReadingLayout>

      <PasscodeModal
        opened={modalOpened}
        onClose={closeModal}
        onSubmit={submitPasscode}
        isInvalid={invalidAttempt}
        title="Chương học được bảo vệ"
      />
    </>
  );
}