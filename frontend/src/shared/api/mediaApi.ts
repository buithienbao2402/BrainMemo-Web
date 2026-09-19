import axios from 'axios';
import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';

export type MediaKind = 'IMAGE' | 'AUDIO' | 'VIDEO';

export interface MediaUploadResponse {
    /** URL tuyệt đối, chỉ dùng để preview ngay sau upload */
    url: string;
    /** Đường dẫn tương đối, đây là giá trị cần LƯU vào DB */
    objectKey: string;
    fileName: string;
    mediaType: MediaKind;
    fileSize: number;
}

export const MEDIA_MAX_MB: Record<MediaKind, number> = { IMAGE: 5, AUDIO: 20, VIDEO: 100 };

export async function uploadMedia(file: File, mediaType: MediaKind): Promise<MediaUploadResponse> {
    const maxMb = MEDIA_MAX_MB[mediaType];
    if (file.size > maxMb * 1024 * 1024) {
        throw new Error(`Tệp ${mediaType.toLowerCase()} tối đa ${maxMb}MB.`);
    }

    const formData = new FormData();
    formData.append('File', file);
    formData.append('MediaType', mediaType);

    // Dùng apiClient (có Bearer token + tự refresh). KHÔNG set Content-Type thủ công
    // để trình duyệt tự gắn boundary cho multipart.
    const { data } = await apiClient.post<ApiResponse<MediaUploadResponse>>('/media/upload', formData);
    return data.data;
}

/** Alias giữ tương thích code cũ (features/blocks/MediaBlockEditor). */
export const uploadMediaApi = uploadMedia;

export function getMediaErrorMessage(err: unknown, fallback = 'Tải tệp lên thất bại, vui lòng thử lại.'): string {
    if (axios.isAxiosError(err)) {
        if (err.response?.status === 413) return 'Tệp quá lớn so với giới hạn của máy chủ.';
        if (err.response?.status === 401) return 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.';
        return (err.response?.data as ApiResponse<null> | undefined)?.message ?? fallback;
    }
    return err instanceof Error ? err.message : fallback;
}