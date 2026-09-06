import { useParams, useNavigate } from 'react-router-dom';
import { Center, Loader, Alert } from '@mantine/core';
import { ReadingLayout } from '@/app/layouts/ReadingLayout';
import { useChapterDetail } from '../hooks/useChapterDetail';
import { usePageDetail } from '../hooks/usePageDetail';
import { useCourseDetail } from '@/features/courses/hooks/useCourseDetail';
import { ContentRenderer } from '../components/ContentRenderer';

export function ChapterReadingPage() {
  const { courseId, chapterId, pageId } = useParams<{
    courseId: string;
    chapterId: string;
    pageId?: string;
  }>();
  const navigate = useNavigate();

  const { data: chapter, isLoading: loadingChapter, isError: chapterError, error: chapterErrObj } =
    useChapterDetail(Number(chapterId));
  const { data: course } = useCourseDetail(Number(courseId));

  const sortedPages = chapter ? [...chapter.pages].sort((a, b) => a.orderIndex - b.orderIndex) : [];
  const activePageId = pageId ? Number(pageId) : sortedPages[0]?.id;
  const { data: page, isLoading: loadingPage } = usePageDetail(activePageId);

  if (loadingChapter) return <Center h={300}><Loader color="orange" /></Center>;
  if (chapterError) return <Alert color="red">{(chapterErrObj as Error).message}</Alert>;
  if (!chapter) return null;

  const currentIndex = sortedPages.findIndex((p) => p.id === activePageId);
  const totalPages = sortedPages.length;

  const goToPage = (id: number) => navigate(`/courses/${courseId}/learn/${chapterId}/${id}`);

  const tocPages = sortedPages.map((p) => ({
    id: p.id,
    title: p.title,
    orderIndex: p.orderIndex,
    isLocked: false, // đã qua check quyền ở BE khi load chapter -> không có trang nào bị khóa riêng
  }));

  return (
    <ReadingLayout
      courseTitle={course?.title ?? ''}
      chapterTitle={chapter.title}
      progressPercent={0} // chưa có API tiến độ (GET /api/courses/{id}/progress)
      currentPageIndex={currentIndex + 1}
      totalPages={totalPages}
      isPrevDisabled={currentIndex <= 0}
      isNextDisabled={currentIndex >= totalPages - 1}
      onBack={() => navigate(`/courses/${courseId}`)}
      onPrev={() => sortedPages[currentIndex - 1] && goToPage(sortedPages[currentIndex - 1].id)}
      onNext={() => sortedPages[currentIndex + 1] && goToPage(sortedPages[currentIndex + 1].id)}
      tocPages={tocPages}
      currentPageId={activePageId}
      onNavigateToPage={goToPage}
    >
      {loadingPage || !page ? (
        <Center h={200}><Loader color="orange" /></Center>
      ) : (
        <ContentRenderer blocks={page.blocks} />
      )}
    </ReadingLayout>
  );
}