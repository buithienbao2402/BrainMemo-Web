// frontend/src/features/auth/hooks/useAuth.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import type {
  LoginPayload,
  RegisterRequestOtpPayload,
  RegisterVerifyPayload,
  ForgotPasswordRequestOtpPayload,
  ForgotPasswordVerifyPayload,
} from '../types/auth.types';

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (response) => {
      if (response.data) {
        const { accessToken, user } = response.data;
        setAuth(accessToken, user);
      }
    }
  });
}

export function useRequestRegisterOtp() {
  return useMutation({
    mutationFn: (payload: RegisterRequestOtpPayload) => authApi.requestRegisterOtp(payload),
  });
}

export function useVerifyRegisterOtp() {
  return useMutation({
    mutationFn: (payload: RegisterVerifyPayload) => authApi.verifyRegisterOtp(payload),
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearAuth();
      // Xóa cache profile của tài khoản vừa đăng xuất, tránh lộ/ghi đè nhầm khi
      // tài khoản khác đăng nhập tiếp trên cùng trình duyệt.
      queryClient.removeQueries({ queryKey: ['my-profile'] });
    },
  });
}

export function useForgotPasswordRequestOtp() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordRequestOtpPayload) =>
      authApi.requestForgotPasswordOtp(payload),
  });
}

export function useForgotPasswordVerify() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordVerifyPayload) => authApi.verifyForgotPassword(payload),
  });
}