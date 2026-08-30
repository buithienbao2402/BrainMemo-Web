import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import type { RegisterRequestOtpPayload, RegisterVerifyPayload } from '../types/auth.types';

/** Bước 1: gửi thông tin đăng ký, nhận OTP qua email. Cũng dùng lại để "Gửi lại mã". */
export function useRequestRegisterOtp() {
  return useMutation({
    mutationFn: (payload: RegisterRequestOtpPayload) => authApi.requestRegisterOtp(payload),
  });
}

/** Bước 2: xác thực OTP -> tạo tài khoản. */
export function useVerifyRegisterOtp() {
  return useMutation({
    mutationFn: (payload: RegisterVerifyPayload) => authApi.verifyRegisterOtp(payload),
  });
}