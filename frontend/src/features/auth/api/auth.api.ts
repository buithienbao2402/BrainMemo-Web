import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type { RegisterRequestOtpPayload, RegisterVerifyPayload } from '../types/auth.types';

export const authApi = {
  /** POST /api/auth/register/request-otp -> gửi OTP qua email */
  requestRegisterOtp: async (payload: RegisterRequestOtpPayload) => {
    const { data } = await apiClient.post<ApiResponse<null>>(
      '/auth/register/request-otp',
      payload
    );
    return data;
  },

  /** POST /api/auth/register/verify -> hash password, tạo user */
  verifyRegisterOtp: async (payload: RegisterVerifyPayload) => {
    const { data } = await apiClient.post<ApiResponse<null>>('/auth/register/verify', payload);
    return data;
  },
};