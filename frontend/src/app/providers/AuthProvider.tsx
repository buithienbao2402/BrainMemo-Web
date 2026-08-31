import { useEffect } from 'react';
import { LoadingOverlay } from '@mantine/core';
import { useAuthStore } from '@/features/auth/store/authStore';
import { authApi } from '@/features/auth/api/auth.api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isInitialized, setInitialized, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        // Xin token mới bằng Cookie
        const refreshRes = await authApi.refreshToken();
        const token = refreshRes.data.accessToken; 
        
        // Có token thì gọi xin info user
        const userRes = await authApi.getCurrentUser();
        const user = userRes.data;

        setAuth(token, user);
      } catch (error) {
        // Lỗi 401 hoặc chưa đăng nhập thì dọn dẹp (user vẫn có thể xem trang public)
        clearAuth();
      } finally {
        setInitialized(true);
      }
    };

    bootstrapAuth();
  }, [setAuth, clearAuth, setInitialized]);

  if (!isInitialized) {
    return (
      <div style={{ height: '100vh', position: 'relative' }}>
        <LoadingOverlay visible={true} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
      </div>
    );
  }

  return <>{children}</>;
}