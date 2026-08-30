import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  clear: () => void;
}

/**
 * Chỉ giữ access token trong bộ nhớ (không persist ra localStorage để
 * tránh XSS đánh cắp token). Refresh token nằm ở HttpOnly Cookie, FE
 * không đọc/ghi được. Dùng chung cho luồng Login sau này.
 */
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
  clear: () => set({ accessToken: null }),
}));