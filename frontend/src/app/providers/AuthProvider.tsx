import { useEffect } from 'react';
import { LoadingOverlay } from '@mantine/core';
import { useAuthStore } from '@/features/auth/store/authStore';
import { authApi } from '@/features/auth/api/auth.api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isInitialized, setInitialized, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        // Bước 1: Xin access token mới bằng refresh token nằm trong HttpOnly Cookie
        const refreshRes = await authApi.refreshToken();
        const token = refreshRes.data.accessToken;

        // Bước 2: LƯU TOKEN VÀO STORE NGAY LẬP TỨC — trước khi gọi bất kỳ API nào khác.
        // Lý do: axios interceptor (xem axios.ts) đọc accessToken từ
        // useAuthStore.getState() để gắn header Authorization cho MỌI request.
        // Nếu gọi getCurrentUser() trước khi token được lưu vào store,
        // request đó sẽ đi mà KHÔNG có header Authorization -> backend trả 401
        // -> rơi vào catch -> clearAuth() -> route guard đá về /login,
        // dù refresh-token vừa chạy thành công.
        useAuthStore.setState({ accessToken: token });

        // Bước 3: Giờ mới gọi lấy thông tin user, request này đã có header đúng
        const userRes = await authApi.getCurrentUser();
        const user = userRes.data;

        // Bước 4: Set lại đầy đủ cả token lẫn user vào store (đồng bộ state cuối cùng)
        setAuth(token, user);
      } catch (error) {
        // Lỗi 401/404 ở đây là bình thường: chưa đăng nhập, hoặc refresh token
        // đã hết hạn/bị thu hồi. Dọn sạch state, cho phép user xem trang public.
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