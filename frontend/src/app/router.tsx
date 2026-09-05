import { Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import CreatorDashboard from '@/features/course-management/pages/CreatorDashboard';
import { useAuthStore } from '@/features/auth/store/authStore';
import { CourseDetailDashboard } from '@/features/course-management/pages/CourseDetailDashboard';
import { CourseDashboardLayout } from '@/app/layouts/CourseDashboardLayout';
import ChapterBuilderPage from '@/features/page-content/pages/ChapterBuilderPage';

export function AppRouter() {
  const { accessToken } = useAuthStore();

  return (
    <Routes>
      {/* Các route Auth (Tự văng ra Dashboard nếu đã login) */}
      <Route path="/login" element={accessToken ? <Navigate to="/creator/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={accessToken ? <Navigate to="/creator/dashboard" replace /> : <RegisterPage />} />
      
      {/* =========================================
          LUỒNG THẬT - YÊU CẦU ĐĂNG NHẬP (PROTECTED)
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

      {/* Route mới thêm cho màn hình Tạo chương (Full-page) */}
      <Route 
        path="/creator/courses/:courseId/chapters/new" 
        element={accessToken ? <ChapterBuilderPage /> : <Navigate to="/login" replace />} 
      />

      {/* Route dự phòng: Bấm bậy bạ thì văng về Dashboard (rồi Dashboard sẽ tự check login) */}
      <Route path="*" element={<Navigate to="/creator/dashboard" replace />} />
    </Routes>
  );
}