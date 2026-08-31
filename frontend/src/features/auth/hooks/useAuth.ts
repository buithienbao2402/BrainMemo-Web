import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import type {
  LoginPayload,
  RegisterRequestOtpPayload,
  RegisterVerifyPayload,
} from '../types/auth.types';

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (response) => {
      // Bóc token và user từ API Backend lưu vào Zustand
      if (response.data) {
        const { accessToken, user } = response.data;
        setAuth(accessToken, user);
      }
    }
  });
}

/** Bước 1 đăng ký: gửi thông tin, nhận OTP qua email. Dùng lại cho "Gửi lại mã". */
export function useRequestRegisterOtp() {
  return useMutation({
    mutationFn: (payload: RegisterRequestOtpPayload) => authApi.requestRegisterOtp(payload),
  });
}

/** Bước 2 đăng ký: xác thực OTP -> tạo tài khoản. */
export function useVerifyRegisterOtp() {
  return useMutation({
    mutationFn: (payload: RegisterVerifyPayload) => authApi.verifyRegisterOtp(payload),
  });
}