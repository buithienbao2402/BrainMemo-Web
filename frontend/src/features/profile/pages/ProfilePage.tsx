import { useState, useEffect } from 'react';
import { Paper, TextInput, Textarea, Button, Stack, Group, FileButton, PasswordInput, Divider, Loader, Center } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMyProfile, useUpdateProfile, useChangePassword } from '../hooks/useProfile';
import { getPresignedUrl, uploadToMinio } from '../api/profile.api';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '@/shared/types/api.types';

export function ProfilePage() {
  const { data: profile, isLoading } = useMyProfile();
  const updateProfile = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarObjectKey, setAvatarObjectKey] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setBio(profile.bio ?? '');
      setAvatarPreview(profile.avatarUrl);
    }
  }, [profile]);

  const handleAvatarChange = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const { uploadUrl, objectKey } = await getPresignedUrl(file.name, file.type);
      await uploadToMinio(uploadUrl, file);
      setAvatarObjectKey(objectKey);
      setAvatarPreview(URL.createObjectURL(file));
    } catch {
      notifications.show({ color: 'red', message: 'Tải ảnh đại diện thất bại' });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = () => {
    if (!profile) return;
    updateProfile.mutate(
      { fullName, bio, avatarUrl: avatarObjectKey ?? profile.avatarUrl, notificationEnabled: profile.notificationEnabled, themeMode: profile.themeMode },
      {
        onSuccess: () => notifications.show({ color: 'green', message: 'Cập nhật thông tin thành công' }),
        onError: () => notifications.show({ color: 'red', message: 'Cập nhật thất bại' }),
      }
    );
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword) {
      notifications.show({ color: 'red', message: 'Vui lòng nhập đầy đủ mật khẩu cũ và mới.' });
      return;
    }

    changePasswordMutation.mutate(
      { oldPassword, newPassword },
      {
        onSuccess: () => {
          notifications.show({ color: 'green', message: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.' });
          navigate('/login');
        },
        onError: (err) => {
          const axiosErr = err as AxiosError<ApiResponse<null>>;
          const errorMessage = axiosErr.response?.data?.message || 'Đổi mật khẩu thất bại. Kiểm tra lại mật khẩu cũ.';
          notifications.show({ color: 'red', message: errorMessage });
        }
      }
    );
  };

  if (isLoading) return <Center h={300}><Loader color="orange" /></Center>;

  return (
    <Stack gap="lg" p="lg" maw={600} mx="auto">
      <Paper shadow="sm" radius="md" p="lg">
        <Stack gap="md">
          <Group>
            <UserAvatar fullName={fullName} avatarUrl={avatarPreview} size={80} />
            <FileButton onChange={handleAvatarChange} accept="image/png,image/jpeg,image/webp">
              {(props) => <Button {...props} variant="light" loading={uploading}>Đổi ảnh đại diện</Button>}
            </FileButton>
          </Group>

          <TextInput label="Họ tên" value={fullName} onChange={(e) => setFullName(e.currentTarget.value)} />
          <Textarea label="Giới thiệu" value={bio} onChange={(e) => setBio(e.currentTarget.value)} minRows={3} />

          <Group justify="flex-end">
            <Button color="orange" onClick={handleSaveProfile} loading={updateProfile.isPending}>Lưu thay đổi</Button>
          </Group>
        </Stack>
      </Paper>

      <Paper shadow="sm" radius="md" p="lg">
        <Stack gap="md">
          <Divider label="Đổi mật khẩu" labelPosition="left" />
          <PasswordInput label="Mật khẩu cũ" value={oldPassword} onChange={(e) => setOldPassword(e.currentTarget.value)} />
          <PasswordInput label="Mật khẩu mới" value={newPassword} onChange={(e) => setNewPassword(e.currentTarget.value)} />
          <Group justify="flex-end">
            <Button color="dark" onClick={handleChangePassword} loading={changePasswordMutation.isPending}>Đổi mật khẩu</Button>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}