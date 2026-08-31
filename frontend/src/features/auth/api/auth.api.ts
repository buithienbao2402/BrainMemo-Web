import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type {
  LoginPayload,
  RegisterRequestOtpPayload,
  RegisterVerifyPayload,
} from '../types/auth.types';
import type { UserProfile } from '../store/authStore';

export interface LoginResponseData {
  accessToken: string;
  user: UserProfile; // Update type theo thực tế backend
}

export const authApi = {
  /** POST /api/auth/login -> access token + user info + Set-Cookie refresh token */
  login: async (payload: LoginPayload) => {
    const { data } = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', payload);
    return data;
  },

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

  /** POST /api/auth/refresh-token -> đọc cookie -> trả access token mới */
  refreshToken: async () => {
    const { data } = await apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh-token');
    return data;
  },

  /** GET /api/users/me -> Lấy thông tin user hiện tại */
  getCurrentUser: async () => {
    const { data } = await apiClient.get<ApiResponse<UserProfile>>('/users/me');
    return data;
  }
};