import { useState } from 'react';
import { TextInput, PasswordInput, PinInput, Button, Alert, Anchor, Text, Group, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconMail, IconLock, IconAlertCircle, IconArrowRight, IconArrowLeft } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '@/shared/types/api.types';
import { useForgotPasswordRequestOtp, useForgotPasswordVerify } from '../hooks/useAuth';
import classes from './AuthForm.module.css';

interface EmailStepValues {
  email: string;
}

interface ResetStepValues {
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

function extractErrorMessage(err: unknown, fallback: string) {
  const axiosErr = err as AxiosError<ApiResponse<null>>;
  return axiosErr.response?.data?.message ?? fallback;
}

export function ForgotPasswordForm() {
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();

  const requestOtp = useForgotPasswordRequestOtp();
  const verifyReset = useForgotPasswordVerify();

  const emailForm = useForm<EmailStepValues>({
    initialValues: { email: '' },
    validate: {
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Email không hợp lệ'),
    },
  });

  const resetForm = useForm<ResetStepValues>({
    initialValues: { otp: '', newPassword: '', confirmPassword: '' },
    validate: {
      otp: (value) => (value.length === 6 ? null : 'Mã OTP gồm 6 chữ số'),
      newPassword: (value) => (value.length >= 6 ? null : 'Mật khẩu cần ít nhất 6 ký tự'),
      confirmPassword: (value, values) =>
        value === values.newPassword ? null : 'Mật khẩu xác nhận không khớp',
    },
  });

  const handleRequestOtp = emailForm.onSubmit((values) => {
    setServerError(null);
    requestOtp.mutate(
      { email: values.email },
      {
        onSuccess: () => {
          setEmail(values.email);
          setStep('reset');
        },
        onError: (err) => setServerError(extractErrorMessage(err, 'Gửi mã OTP thất bại. Vui lòng thử lại.')),
      }
    );
  });

  const handleResendOtp = () => {
    setServerError(null);
    requestOtp.mutate(
      { email },
      { onError: (err) => setServerError(extractErrorMessage(err, 'Gửi lại mã OTP thất bại.')) }
    );
  };

  const handleResetPassword = resetForm.onSubmit((values) => {
    setServerError(null);
    verifyReset.mutate(
      { email, otp: values.otp, newPassword: values.newPassword },
      {
        onSuccess: () => navigate('/login', { replace: true }),
        onError: (err) => {
          const axiosErr = err as AxiosError<ApiResponse<null>>;
          const apiErrors = axiosErr.response?.data?.errors;
          if (apiErrors?.length) {
            const fieldErrors: Record<string, string> = {};
            apiErrors.forEach((e) => {
              fieldErrors[e.field] = e.message;
            });
            resetForm.setErrors(fieldErrors);
          } else {
            setServerError(extractErrorMessage(err, 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.'));
          }
        },
      }
    );
  });

  if (step === 'email') {
    return (
      <form onSubmit={handleRequestOtp} className={classes.form} noValidate>
        <h1 className={classes.title}>Quên mật khẩu</h1>
        <Text size="sm" c="dimmed" mb="md">
          Nhập email đã đăng ký, chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
        </Text>

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
          mb="xl"
          {...emailForm.getInputProps('email')}
        />

        <Button
          type="submit"
          fullWidth
          size="md"
          loading={requestOtp.isPending}
          rightSection={<IconArrowRight size={16} />}
          classNames={{ root: classes.submitButton }}
        >
          Gửi mã OTP
        </Button>

        <Text ta="center" mt="lg" size="sm" c="dimmed">
          <Anchor component={Link} to="/login" className={classes.link}>
            <Group gap={4} justify="center" component="span">
              <IconArrowLeft size={14} /> Quay lại đăng nhập
            </Group>
          </Anchor>
        </Text>
      </form>
    );
  }

  return (
    <form onSubmit={handleResetPassword} className={classes.form} noValidate>
      <h1 className={classes.title}>Đặt lại mật khẩu</h1>
      <Text size="sm" c="dimmed" mb="md">
        Mã OTP đã được gửi tới <b>{email}</b>. Nhập mã và mật khẩu mới.
      </Text>

      {serverError && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md" variant="light">
          {serverError}
        </Alert>
      )}

      <Stack gap="md" mb="md">
        <div>
          <Text size="sm" fw={500} mb={4}>Mã OTP</Text>
          <PinInput length={6} {...resetForm.getInputProps('otp')} />
        </div>

        <PasswordInput
          label="Mật khẩu mới"
          placeholder="••••••••"
          leftSection={<IconLock size={16} />}
          size="md"
          {...resetForm.getInputProps('newPassword')}
        />

        <PasswordInput
          label="Xác nhận mật khẩu mới"
          placeholder="••••••••"
          leftSection={<IconLock size={16} />}
          size="md"
          {...resetForm.getInputProps('confirmPassword')}
        />
      </Stack>

      <Group justify="space-between" mb="xl">
        <Anchor size="sm" className={classes.link} onClick={handleResendOtp}>
          Gửi lại mã
        </Anchor>
        <Anchor size="sm" className={classes.link} onClick={() => setStep('email')}>
          Đổi email khác
        </Anchor>
      </Group>

      <Button
        type="submit"
        fullWidth
        size="md"
        loading={verifyReset.isPending}
        rightSection={<IconArrowRight size={16} />}
        classNames={{ root: classes.submitButton }}
      >
        Đặt lại mật khẩu
      </Button>
    </form>
  );
}