import { create } from 'zustand';

interface AuthVisualState {
  emailFilled: boolean;
  /** 0 = rỗng, 1 = đang gõ, 2 = đủ mạnh (>6 ký tự) */
  passwordStrength: 0 | 1 | 2;
  setEmailFilled: (filled: boolean) => void;
  setPasswordStrength: (strength: 0 | 1 | 2) => void;
  reset: () => void;
}

/**
 * State thuần UI cho hiệu ứng InteractiveBrain — KHÔNG chứa dữ liệu form thật
 * (không lưu email/password). Nếu không có nơi nào gọi setter, Brain vẫn chạy
 * bình thường ở trạng thái idle (mặc định false/0).
 */
export const useAuthVisualStore = create<AuthVisualState>((set) => ({
  emailFilled: false,
  passwordStrength: 0,
  setEmailFilled: (filled) => set({ emailFilled: filled }),
  setPasswordStrength: (strength) => set({ passwordStrength: strength }),
  reset: () => set({ emailFilled: false, passwordStrength: 0 }),
}));