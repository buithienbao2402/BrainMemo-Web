import { useEffect, useState } from 'react';
import { TextInput, PasswordInput, Button, Alert, Anchor, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUser, IconMail, IconLock, IconAlertCircle } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '@/shared/types/api.types';
import { useRequestRegisterOtp } from '../hooks/useAuth';
import { useAuthVisualStore } from '../store/authVisualStore';
import type { RegisterRequestOtpPayload } from '../types/auth.types';
import classes from './AuthForm.module.css';

interface RegisterFormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormProps {
  /** Gọi khi request-otp thành công, kèm payload để bước OTP có thể dùng lại (resend). */
  onSuccess: (payload: RegisterRequestOtpPayload) => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { mutate, isPending } = useRequestRegisterOtp();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    initialValues: { fullName: '', email: '', password: '', confirmPassword: '' },
    validate: {
      fullName: (value) => (value.trim().length < 2 ? 'Họ và tên phải có ít nhất 2 ký tự' : null),
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Email không hợp lệ'),
      password: (value) => (value.length < 8 ? 'Mật khẩu phải có ít nhất 8 ký tự' : null),
      confirmPassword: (value, values) =>
        value !== values.password ? 'Mật khẩu xác nhận không khớp' : null,
    },
  });

  const setEmailFilled = useAuthVisualStore((s) => s.setEmailFilled);
  const setPasswordStrength = useAuthVisualStore((s) => s.setPasswordStrength);
  const resetVisual = useAuthVisualStore((s) => s.reset);

  // Báo trạng thái gõ email/password sang InteractiveBrain (panel trái) - không
  // ảnh hưởng validate/submit hiện có.
  useEffect(() => {
    setEmailFilled(/^\S+@\S+\.\S+$/.test(form.values.email));
    setPasswordStrength(
      form.values.password.length === 0 ? 0 : form.values.password.length > 6 ? 2 : 1
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.email, form.values.password]);

  useEffect(() => resetVisual, [resetVisual]);

  const handleSubmit = form.onSubmit((values) => {
    setServerError(null);
    const payload: RegisterRequestOtpPayload = {
      email: values.email.trim(),
      password: values.password,
      fullName: values.fullName.trim(),
    };

    mutate(payload, {
      onSuccess: () => onSuccess(payload),
      onError: (err) => {
        const axiosErr = err as AxiosError<ApiResponse<null>>;
        const message =
          axiosErr.response?.data?.errors?.[0]?.message ??
          axiosErr.response?.data?.message ??
          'Đăng ký thất bại. Vui lòng thử lại.';
        setServerError(message);
      },
    });
  });

  return (
    <form onSubmit={handleSubmit} className={classes.form} noValidate>
      <h1 className={classes.title}>Đăng ký</h1>

      {serverError && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md" variant="light">
          {serverError}
        </Alert>
      )}

      <TextInput
        label="Họ và tên"
        placeholder="Nguyễn Văn A"
        leftSection={<IconUser size={16} />}
        size="md"
        mb="md"
        {...form.getInputProps('fullName')}
      />

      <TextInput
        label="Email"
        placeholder="ten@vidu.com"
        leftSection={<IconMail size={16} />}
        size="md"
        mb="md"
        {...form.getInputProps('email')}
      />

      <PasswordInput
        label="Mật khẩu"
        placeholder="••••••••"
        leftSection={<IconLock size={16} />}
        size="md"
        mb="md"
        {...form.getInputProps('password')}
      />

      <PasswordInput
        label="Xác nhận mật khẩu"
        placeholder="••••••••"
        leftSection={<IconLock size={16} />}
        size="md"
        mb="xl"
        {...form.getInputProps('confirmPassword')}
      />

      <Button
        type="submit"
        fullWidth
        size="md"
        loading={isPending}
        classNames={{ root: classes.submitButton }}
      >
        Đăng ký
      </Button>

      <Text ta="center" mt="lg" size="sm" c="dimmed">
        Đã có tài khoản?{' '}
        <Anchor component={Link} to="/login" className={classes.link}>
          Đăng nhập
        </Anchor>
      </Text>
    </form>
  );
}