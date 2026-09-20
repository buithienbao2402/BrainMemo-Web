// frontend/src/shared/hooks/usePasscodeAccess.ts
import { useCallback, useEffect, useState } from 'react';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '@/shared/types/api.types';

export type PasscodeErrorCode = 'PASSCODE_REQUIRED' | 'PASSCODE_INVALID';

function extractPasscodeErrorCode(error: unknown): PasscodeErrorCode | null {
  const axiosErr = error as AxiosError<ApiResponse<any>>;
  const responseData = axiosErr?.response?.data;

  // 1. Quét kiểm tra linh hoạt trong mảng hoặc object errors từ BE (hỗ trợ cả code lẫn Code)
  const errContainer = responseData?.errors;
  const errItem = Array.isArray(errContainer) ? errContainer[0] : errContainer;
  const rawCode = errItem?.code || (errItem as any)?.Code;

  if (rawCode === 'PASSCODE_REQUIRED' || rawCode === 'PASSCODE_INVALID') {
    return rawCode;
  }

  // 2. Dự phòng kiểm tra trực tiếp trong message nếu Backend trả thẳng mã lỗi qua message
  const message = responseData?.message;
  if (message === 'PASSCODE_REQUIRED' || message === 'PASSCODE_INVALID') {
    return message as PasscodeErrorCode;
  }

  // 3. Fallback về logic gốc của Bố Thuận để đảm bảo không lệch pha bất kỳ trường hợp nào khác
  const code = responseData?.errors?.[0]?.code;
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

  // GIỮ NGUYÊN KHUNG CŨ, THÊM LỆNH TỰ ĐỘNG ĐÓNG MODAL KHI SUBMIT PASSCODE MỚI
  const submitPasscode = useCallback((value: string) => {
    setPasscode(value);
    setModalOpened(false);   // <--- Tự động sập modal xuống
    setInvalidAttempt(false); // <--- Xóa trạng thái báo lỗi đỏ
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