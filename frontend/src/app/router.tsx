import { Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import CreatorDashboard from '@/features/course-management/pages/CreatorDashboard';
import { useAuthStore } from '@/features/auth/store/authStore';
import { CourseDetailDashboard } from '@/features/course-management/pages/CourseDetailDashboard';
import { CourseDashboardLayout } from '@/app/layouts/CourseDashboardLayout';

export function AppRouter() {
  const { accessToken } = useAuthStore();

  return (
    <Routes>
      {/* Các route không cần đăng nhập */}
      <Route path="/login" element={accessToken ? <Navigate to="/creator/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={accessToken ? <Navigate to="/creator/dashboard" replace /> : <RegisterPage />} />
      
      {/* =========================================
          TODO: LUỒNG THẬT (MỞ KHÓA KHI CÓ BACKEND) 
          <Route path="/creator/dashboard" element={accessToken ? <CreatorDashboard /> : <Navigate to="/login" replace />} /> 
          <Route path="/creator/courses/:id" element={accessToken ? <CourseDashboardLayout><CourseDetailDashboard /></CourseDashboardLayout> : <Navigate to="/login" replace />} />
          ========================================= */}

      {/* TODO: LUỒNG FAKE (XÓA KHI CÓ BACKEND) - Bypass login để test giao diện */}
      <Route path="/creator/dashboard" element={<CreatorDashboard />} />

      {/* Route mới thêm cho trang chi tiết khóa học, có bọc Layout */}
      <Route 
        path="/creator/courses/:id" 
        element={
          <CourseDashboardLayout>
            <CourseDetailDashboard />
          </CourseDashboardLayout>
        } 
      />
      
      {/* Đổi luôn chỗ này: Bấm bậy bạ thì tự động về Dashboard để rảnh tay test UI, không bị sút ra Login nữa */}
      <Route path="*" element={<Navigate to="/creator/dashboard" replace />} />
    </Routes>
  );
}