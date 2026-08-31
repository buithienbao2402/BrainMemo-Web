import { create } from 'zustand';

export interface UserProfile {
  userId: string | number;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

interface AuthState {
  accessToken: string | null;
  user: UserProfile | null;
  isInitialized: boolean;
  setAuth: (token: string, user: UserProfile) => void;
  clearAuth: () => void;
  setInitialized: (status: boolean) => void;
}

/**
 * Chỉ giữ access token và thông tin user trong bộ nhớ (không persist ra localStorage để
 * tránh XSS đánh cắp token). Refresh token nằm ở HttpOnly Cookie, FE
 * không đọc/ghi được. Dùng chung cho luồng Login sau này.
 */
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isInitialized: false,
  setAuth: (token, user) => set({ accessToken: token, user }),
  clearAuth: () => set({ accessToken: null, user: null }),
  setInitialized: (status) => set({ isInitialized: status }),
}));