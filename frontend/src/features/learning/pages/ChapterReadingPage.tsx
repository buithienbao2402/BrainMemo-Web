import { useParams, useNavigate } from 'react-router-dom';
import { Center, Loader, Alert } from '@mantine/core';
import { useChapterDetail } from '../hooks/useChapterDetail';
import { usePageDetail } from '../hooks/usePageDetail';
import { ContentRenderer } from '../components/ContentRenderer';
// import ReadingLayout từ app/layouts nếu muốn dùng tab bar sẵn có

export function ChapterReadingPage() {
  const { chapterId, pageId } = useParams<{ chapterId: string; pageId?: string }>();
  const navigate = useNavigate();

  const { data: chapter, isLoading: loadingChapter, isError: chapterError, error: chapterErrObj } =
    useChapterDetail(Number(chapterId));

  const activePageId = pageId ? Number(pageId) : chapter?.pages[0]?.id;
  const { data: page, isLoading: loadingPage } = usePageDetail(activePageId);

  if (loadingChapter) return <Center h={300}><Loader color="orange" /></Center>;
  if (chapterError) return <Alert color="red">{(chapterErrObj as Error).message}</Alert>;
  if (!chapter) return null;

  return (
    <div>
      {/* Tab bar danh sách trang — gắn vào ReadingLayout thực tế của dự án */}
      {chapter.pages.map((p) => (
        <button key={p.id} onClick={() => navigate(`/courses/x/learn/${chapterId}/${p.id}`)}>
          {p.orderIndex}. {p.title}
        </button>
      ))}

      {loadingPage || !page ? <Loader /> : <ContentRenderer blocks={page.blocks} />}
    </div>
  );
}