import { useState } from 'react';
import { AuthLayout } from '@/app/layouts/AuthLayout';
import { RegisterForm } from '../components/RegisterForm';
import { OtpVerificationForm } from '../components/OtpVerificationForm';
import type { RegisterRequestOtpPayload } from '../types/auth.types';

type RegisterStep = 'form' | 'otp';

export default function RegisterPage() {
  const [step, setStep] = useState<RegisterStep>('form');
  const [payload, setPayload] = useState<RegisterRequestOtpPayload | null>(null);

  return (
    <AuthLayout>
      {step === 'form' && (
        <RegisterForm
          onSuccess={(values) => {
            setPayload(values);
            setStep('otp');
          }}
        />
      )}

      {step === 'otp' && payload && (
        <OtpVerificationForm payload={payload} onBack={() => setStep('form')} />
      )}
    </AuthLayout>
  );
}