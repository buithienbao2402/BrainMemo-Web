// File: src/router.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import CreatorDashboard from '@/features/course-management/pages/CreatorDashboard';
import { useAuthStore } from '@/features/auth/store/authStore';
import { CourseDetailDashboard } from '@/features/course-management/pages/CourseDetailDashboard';
import { CourseDashboardLayout } from '@/app/layouts/CourseDashboardLayout';
import ChapterBuilderPage from '@/features/page-content/pages/ChapterBuilderPage';
import { StudentCourseLayout } from '@/app/layouts/StudentCourseLayout';
import { CourseDetailPage } from '@/features/courses/pages/CourseDetailPage';
import { ReadingLayout } from '@/app/layouts/ReadingLayout';
import { mockChapterDetail, mockPagesById } from '@/features/learning/mock/mockReadingData';
import { ContentRenderer } from '@/features/learning/components/ContentRenderer';

function ReadingModeDemo() {
  const totalPages = mockChapterDetail.pages.length; 
  const [currentPageId, setCurrentPageId] = useState(14); 

  const currentPage = mockPagesById[currentPageId];

  const handlePrev = () => setCurrentPageId((id) => Math.max(1, id - 1));
  const handleNext = () => setCurrentPageId((id) => Math.min(totalPages, id + 1));

  // Map dữ liệu chapter sang shape TocPageItem cho Drawer Mục lục của ReadingLayout
  const tocPages = mockChapterDetail.pages.map((p) => ({
    id: p.id,
    title: p.title,
    orderIndex: p.orderIndex,
    isLocked: false,
  }));

  return (
    <ReadingLayout
      courseTitle="Nhập Môn Python - Từ Zero tới Hero"
      chapterTitle={mockChapterDetail.title}
      progressPercent={25}
      currentPageIndex={currentPageId}
      totalPages={totalPages}
      isPrevDisabled={currentPageId <= 1}
      isNextDisabled={currentPageId >= totalPages}
      onBack={() => window.history.back()}
      onPrev={handlePrev}
      onNext={handleNext}
      tocPages={tocPages}
      currentPageId={currentPageId}
      onNavigateToPage={(pageId) => setCurrentPageId(pageId)}
    >
      {currentPage ? (
        <ContentRenderer blocks={currentPage.blocks} />
      ) : (
        <div style={{ color: '#868e96', textAlign: 'center' }}>
          Trang {currentPageId} chưa có dữ liệu mock (demo giới hạn ở trang 13-15).
        </div>
      )}
    </ReadingLayout>
  );
}

export function AppRouter() {
  const { accessToken } = useAuthStore();

  return (
    <Routes>
      {/* Các route Auth (Tự văng ra Dashboard nếu đã login) */}
      <Route path="/login" element={accessToken ? <Navigate to="/creator/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={accessToken ? <Navigate to="/creator/dashboard" replace /> : <RegisterPage />} />
      
      {/* =========================================
          LUỒNG CREATOR - YÊU CẦU ĐĂNG NHẬP
          ========================================= */}
      
      <Route 
        path="/creator/dashboard" 
        element={accessToken ? <CreatorDashboard /> : <Navigate to="/login" replace />} 
      />

      <Route 
        path="/creator/courses/:id" 
        element={
          accessToken ? (
            <CourseDashboardLayout>
              <CourseDetailDashboard />
            </CourseDashboardLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      <Route 
        path="/creator/courses/:courseId/chapters/new" 
        element={accessToken ? <ChapterBuilderPage /> : <Navigate to="/login" replace />} 
      />

      <Route 
        path="/creator/courses/:courseId/chapters/:chapterId/edit" 
        element={accessToken ? <ChapterBuilderPage /> : <Navigate to="/login" replace />} 
      />

      {/* =========================================
          LUỒNG HỌC VIÊN - YÊU CẦU ĐĂNG NHẬP
          ========================================= */}
      <Route 
        path="/courses/:id" 
        element={
          accessToken ? (
            <StudentCourseLayout>
              <CourseDetailPage />
            </StudentCourseLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      {/* Route Learning Mode (Đọc chương) bảo vệ bằng accessToken chuẩn nhóm */}
      <Route 
        path="/courses/:courseId/learn/:chapterId" 
        element={accessToken ? <ReadingModeDemo /> : <Navigate to="/login" replace />} 
      />

      <Route 
        path="/courses/:courseId/learn/:chapterId/:pageId" 
        element={accessToken ? <ReadingModeDemo /> : <Navigate to="/login" replace />} 
      />

      {/* Route dự phòng: Bấm bậy bạ thì văng về Dashboard (rồi Dashboard sẽ tự check login) */}
      <Route path="*" element={<Navigate to="/creator/dashboard" replace />} />
    </Routes>
  );
}