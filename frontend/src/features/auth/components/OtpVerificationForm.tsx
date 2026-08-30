import { useEffect, useState } from 'react';
import { PinInput, Button, Alert, Text, Anchor } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '@/shared/types/api.types';
import { useRequestRegisterOtp, useVerifyRegisterOtp } from '../hooks/useAuth';
import type { RegisterRequestOtpPayload } from '../types/auth.types';
import classes from './AuthForm.module.css';

const RESEND_COOLDOWN_SECONDS = 60;

interface OtpVerificationFormProps {
  /** Payload từ bước 1 — cần lại đủ { email, password, fullName } để "Gửi lại mã",
   * vì request-otp yêu cầu đủ 3 trường (API_Contract.md mục 2). */
  payload: RegisterRequestOtpPayload;
  onBack: () => void;
}

export function OtpVerificationForm({ payload, onBack }: OtpVerificationFormProps) {
  const [otp, setOtp] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  const { mutate: verifyOtp, isPending: isVerifying } = useVerifyRegisterOtp();
  const { mutate: requestOtp, isPending: isResending } = useRequestRegisterOtp();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const extractErrorMessage = (err: unknown, fallback: string) => {
    const axiosErr = err as AxiosError<ApiResponse<null>>;
    return (
      axiosErr.response?.data?.errors?.[0]?.message ?? axiosErr.response?.data?.message ?? fallback
    );
  };

  const handleVerify = () => {
    if (otp.length !== 6) {
      setServerError('Vui lòng nhập đủ 6 chữ số.');
      return;
    }
    setServerError(null);
    verifyOtp(
      { email: payload.email, otp },
      {
        onSuccess: () => navigate('/login', { state: { justRegistered: true } }),
        onError: (err) =>
          setServerError(extractErrorMessage(err, 'Mã OTP không đúng hoặc đã hết hạn.')),
      }
    );
  };

  const handleResend = () => {
    if (cooldown > 0 || isResending) return;
    setServerError(null);
    setInfoMessage(null);
    requestOtp(payload, {
      onSuccess: () => {
        setCooldown(RESEND_COOLDOWN_SECONDS);
        setInfoMessage('Đã gửi lại mã OTP, vui lòng kiểm tra email.');
      },
      onError: (err) =>
        setServerError(extractErrorMessage(err, 'Không thể gửi lại mã. Vui lòng thử lại.')),
    });
  };

  return (
    <div className={classes.form}>
      <h1 className={classes.title}>Xác thực OTP</h1>
      <Text size="sm" c="dimmed" mb="xl">
        Mã xác thực đã được gửi tới email <strong>{payload.email}</strong>
      </Text>

      {serverError && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md" variant="light">
          {serverError}
        </Alert>
      )}
      {infoMessage && !serverError && (
        <Alert color="green" mb="md" variant="light">
          {infoMessage}
        </Alert>
      )}

      <PinInput
        length={6}
        type="number"
        size="md"
        value={otp}
        onChange={setOtp}
        oneTimeCode
        className={classes.pinInput}
      />

      <Button
        fullWidth
        size="md"
        mt="xl"
        loading={isVerifying}
        onClick={handleVerify}
        classNames={{ root: classes.submitButton }}
      >
        Xác nhận
      </Button>

      <Text ta="center" mt="lg" size="sm" c="dimmed">
        Không nhận được mã?{' '}
        <Anchor
          component="button"
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className={classes.link}
        >
          {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : 'Gửi lại mã'}
        </Anchor>
      </Text>

      <Text ta="center" mt="sm" size="sm">
        <Anchor component="button" type="button" onClick={onBack} className={classes.link}>
          ← Quay lại
        </Anchor>
      </Text>
    </div>
  );
}