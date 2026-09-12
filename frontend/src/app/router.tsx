// File: src/router.tsx
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
import { ChapterReadingPage } from '@/features/learning/pages/ChapterReadingPage';
import { MainLayout } from '@/app/layouts/MainLayout';
import { HomePage } from '@/features/home/pages/HomePage';
import { ExplorePage } from '@/features/explore/pages/ExplorePage';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';

export function AppRouter() {
  const { accessToken } = useAuthStore();

  return (
    <Routes>
      {/* Đã đăng nhập mà cố vào /login hay /register -> văng về Trang chủ */}
      <Route path="/login" element={accessToken ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={accessToken ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route path="/forgot-password" element={accessToken ? <Navigate to="/" replace /> : <ForgotPasswordPage />} />

      {/* ========== LUỒNG CREATOR ========== */}
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

      {/* ========== LUỒNG HỌC VIÊN ========== */}
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
      <Route
        path="/courses/:courseId/learn/:chapterId/:pageId?"
        element={accessToken ? <ChapterReadingPage /> : <Navigate to="/login" replace />}
      />

      <Route path="/" element={accessToken ? (<MainLayout><HomePage /></MainLayout>) : (<Navigate to="/login" replace />)} />
      <Route path="/explore" element={accessToken ? (<MainLayout><ExplorePage /></MainLayout>) : (<Navigate to="/login" replace />)} />
      <Route path="/profile" element={accessToken ? (<MainLayout><ProfilePage /></MainLayout>) : (<Navigate to="/login" replace />)} />

      {/* Route dự phòng: mọi path lạ -> Trang chủ (Home tự lo check login) */}
      <Route path="*" element={<Navigate to="/" replace />} />
      
    </Routes>

  );
}