import { useState } from 'react';
import { TextInput, PasswordInput, Button, Alert, Anchor, Text, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconMail, IconLock, IconAlertCircle, IconArrowRight } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '@/shared/types/api.types';
import { useLogin } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import classes from './AuthForm.module.css';

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginForm() {
  const { mutate, isPending } = useLogin();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    initialValues: { email: '', password: '' },
    validate: {
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Email không hợp lệ'),
      password: (value) => (value.length > 0 ? null : 'Vui lòng nhập mật khẩu'),
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    setServerError(null);
    mutate(values, {
      onSuccess: (res) => {
        if (res.data?.accessToken) setAccessToken(res.data.accessToken);
        navigate('/'); // TODO: đổi thành route dashboard thật khi có
      },
      onError: (err) => {
        const axiosErr = err as AxiosError<ApiResponse<null>>;
        const apiErrors = axiosErr.response?.data?.errors;

        if (apiErrors?.length) {
          const fieldErrors: Record<string, string> = {};
          apiErrors.forEach((e) => {
            fieldErrors[e.field] = e.message;
          });
          form.setErrors(fieldErrors);
        } else {
          setServerError(
            axiosErr.response?.data?.message ?? 'Đăng nhập thất bại. Vui lòng thử lại.'
          );
        }
      },
    });
  });

  return (
    <form onSubmit={handleSubmit} className={classes.form} noValidate>
      <h1 className={classes.title}>Đăng nhập</h1>

      {serverError && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md" variant="light">
          {serverError}
        </Alert>
      )}

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
        {...form.getInputProps('password')}
      />

      <Group justify="flex-end" mt="xs" mb="xl">
        <Anchor component={Link} to="/forgot-password" size="sm" className={classes.link}>
          Quên mật khẩu?
        </Anchor>
      </Group>

      <Button
        type="submit"
        fullWidth
        size="md"
        loading={isPending}
        rightSection={<IconArrowRight size={16} />}
        classNames={{ root: classes.submitButton }}
      >
        Đăng nhập
      </Button>

      <Text ta="center" mt="lg" size="sm" c="dimmed">
        Chưa có tài khoản?{' '}
        <Anchor component={Link} to="/register" className={classes.link}>
          Đăng ký ngay
        </Anchor>
      </Text>
    </form>
  );
}