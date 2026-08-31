import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import type {
  LoginPayload,
  RegisterRequestOtpPayload,
  RegisterVerifyPayload,
} from '../types/auth.types';

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
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