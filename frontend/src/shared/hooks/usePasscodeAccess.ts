// frontend/src/shared/hooks/usePasscodeAccess.ts
import { useCallback, useEffect, useState } from 'react';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '@/shared/types/api.types';

export type PasscodeErrorCode = 'PASSCODE_REQUIRED' | 'PASSCODE_INVALID';

function extractPasscodeErrorCode(error: unknown): PasscodeErrorCode | null {
  const axiosErr = error as AxiosError<ApiResponse<null>>;
  const code = axiosErr?.response?.data?.errors?.[0]?.code;
  return code === 'PASSCODE_REQUIRED' || code === 'PASSCODE_INVALID' ? code : null;
}

/** Trích message thân thiện từ response lỗi của BE, thay vì message mặc định của axios
 * (vd "Request failed with status code 403") — dùng cho các trường hợp 403 không phải passcode
 * (ví dụ PRIVATE) để hiển thị đúng nội dung BE trả về. */
export function extractApiErrorMessage(error: unknown, fallback: string): string {
  const axiosErr = error as AxiosError<ApiResponse<null>>;
  return axiosErr?.response?.data?.message ?? fallback;
}

/**
 * Quản lý luồng "nhập mật khẩu để mở khóa nội dung PROTECTED":
 * - Giữ passcode hiện tại để truyền vào các hook fetch (useCourseDetail, useChapterDetail, usePageDetail...).
 * - Phát hiện lỗi PASSCODE_REQUIRED/PASSCODE_INVALID từ response 403 của BE và tự mở Modal.
 * - `resetKey` (vd. courseId hoặc chapterId): khi đổi sang tài nguyên khác, tự xóa passcode/đóng modal cũ.
 */
export function usePasscodeAccess(resetKey?: unknown) {
  const [passcode, setPasscode] = useState<string | undefined>(undefined);
  const [modalOpened, setModalOpened] = useState(false);
  const [invalidAttempt, setInvalidAttempt] = useState(false);

  useEffect(() => {
    setPasscode(undefined);
    setModalOpened(false);
    setInvalidAttempt(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const handleError = useCallback((error: unknown) => {
    const code = extractPasscodeErrorCode(error);
    if (code === 'PASSCODE_REQUIRED') {
      setInvalidAttempt(false);
      setModalOpened(true);
    } else if (code === 'PASSCODE_INVALID') {
      setInvalidAttempt(true);
      setModalOpened(true);
    }
  }, []);

  const isPasscodeError = useCallback((error: unknown) => extractPasscodeErrorCode(error) !== null, []);

  const submitPasscode = useCallback((value: string) => {
    setPasscode(value);
  }, []);

  const closeModal = useCallback(() => setModalOpened(false), []);

  return {
    passcode,
    modalOpened,
    invalidAttempt,
    handleError,
    isPasscodeError,
    submitPasscode,
    closeModal,
  };
}