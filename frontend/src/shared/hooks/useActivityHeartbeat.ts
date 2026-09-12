import { useEffect, useRef } from 'react';
import { apiClient } from '@/shared/lib/axios';
import { useAuthStore } from '@/features/auth/store/authStore';

const PING_INTERVAL_MS = 60_000;

export function useActivityHeartbeat() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const sendPing = () => {
      if (document.visibilityState === 'visible') {
        apiClient.post('/users/me/heartbeat').catch(() => {});
      }
    };

    intervalRef.current = setInterval(sendPing, PING_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [accessToken]);
}