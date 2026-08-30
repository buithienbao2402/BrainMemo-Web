import axios from 'axios';
import { useAuthStore } from '@/features/auth/store/authStore';

/**
 * Backend không dùng versioning (/api/... thẳng, không /api/v1/...).
 * baseURL trỏ tới gốc "/api", các api.ts trong từng feature chỉ cần
 * khai path tương đối, ví dụ: apiClient.post('/auth/login', payload).
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  // Refresh token nằm trong HttpOnly Cookie -> bắt buộc gửi kèm credentials.
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// TODO(login-feature): response interceptor xử lý 401 -> gọi
// POST /api/auth/refresh-token (đọc cookie), cập nhật lại accessToken
// trong authStore, rồi retry lại request gốc. Chưa cần cho luồng Register.