import { Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import CreatorDashboard from '@/features/course-management/pages/CreatorDashboard';
import { useAuthStore } from '@/features/auth/store/authStore';
import { CourseDetailDashboard } from '@/features/course-management/pages/CourseDetailDashboard';
import { CourseDashboardLayout } from '@/app/layouts/CourseDashboardLayout';
import ChapterBuilderPage from '@/features/page-content/pages/ChapterBuilderPage';
import { StudentCourseLayout } from '@/app/layouts/StudentCourseLayout';
import { CourseDetailPage } from '@/features/courses/pages/CourseDetailPage';

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

      {/* Route dự phòng: Bấm bậy bạ thì văng về Dashboard (rồi Dashboard sẽ tự check login) */}
      <Route path="*" element={<Navigate to="/creator/dashboard" replace />} />
    </Routes>
  );
}