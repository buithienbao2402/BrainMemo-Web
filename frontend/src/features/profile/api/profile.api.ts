import axios from 'axios';
import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type { UserProfile, UpdateProfilePayload } from '../types/profile.types';

export async function fetchMyProfile() {
  const { data } = await apiClient.get<ApiResponse<UserProfile>>('/users/me');
  return data.data;
}

export async function updateMyProfile(payload: UpdateProfilePayload) {
  const { data } = await apiClient.put<ApiResponse<UserProfile>>('/users/me', payload);
  return data.data;
}

export async function changePassword(payload: { oldPassword: string; newPassword: string }) {
  const { data } = await apiClient.put<ApiResponse<null>>('/auth/change-password', payload);
  return data;
}

export async function getPresignedUrl(fileName: string, contentType: string) {
  const { data } = await apiClient.post<ApiResponse<{ uploadUrl: string; objectKey: string; expiresAt: string }>>(
    '/media/presigned-url', { fileName, contentType, mediaType: 'IMAGE' }
  );
  return data.data;
}

export async function uploadToMinio(uploadUrl: string, file: File) {
  // Dùng axios gốc, KHÔNG dùng apiClient — tránh interceptor gắn Authorization/refresh vào presigned URL
  await axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type } });
}

export async function requestChangePasswordOtp() {
  const { data } = await apiClient.post<ApiResponse<null>>('/auth/change-password/request-otp');
  return data;
}

export async function changePasswordWithOtp(payload: { otp: string; newPassword: string }) {
  const { data } = await apiClient.put<ApiResponse<null>>('/auth/change-password-otp', payload);
  return data;
}