import { AuthLayout } from '@/app/layouts/AuthLayout';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}