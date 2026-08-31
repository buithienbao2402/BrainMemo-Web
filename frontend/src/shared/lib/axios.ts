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

// Cờ kiểm soát và hàng đợi request khi đang gọi refresh token
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Response interceptor xử lý 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Dùng axios thuần để không bị lặp vô hạn vào interceptor
        const refreshRes = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshRes.data.data.accessToken;
        const currentUser = useAuthStore.getState().user;
        
        // Nếu app đã boot xong và đang có user, chỉ cần update token
        if (currentUser) {
          useAuthStore.getState().setAuth(newToken, currentUser);
        }

        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();
        window.location.href = '/login'; // Hết token thật sự -> về Login
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);