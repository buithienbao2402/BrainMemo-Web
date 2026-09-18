import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMyProfile, updateMyProfile, changePassword } from '../api/profile.api';
import { useAuthStore } from '@/features/auth/store/authStore';

export function useMyProfile() {
  return useQuery({ queryKey: ['my-profile'], queryFn: fetchMyProfile });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { setAuth, accessToken } = useAuthStore();
  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(['my-profile'], updated);
      if (accessToken) setAuth(accessToken, updated as any); 
    },
  });
}

export function useChangePassword() {
  const { clearAuth } = useAuthStore();
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      clearAuth(); 
      window.location.href = '/login';
    },
  });
}