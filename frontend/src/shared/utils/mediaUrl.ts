const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

function detectOrigin(): string {
    try {
        return new URL(API_BASE, window.location.origin).origin;
    } catch {
        return window.location.origin;
    }
}

// Có thể override bằng VITE_MEDIA_BASE_URL (vd. khi dùng CDN)
const MEDIA_ORIGIN: string = (import.meta.env.VITE_MEDIA_BASE_URL as string | undefined) ?? detectOrigin();

const ABSOLUTE_URL = /^(https?:)?\/\/|^(blob|data):/i;

/**
 * DB lưu objectKey tương đối (/uploads/images/abc.png). Hàm này ghép thành URL hiển thị.
 * - URL tuyệt đối / blob / data -> giữ nguyên (tương thích dữ liệu cũ)
 * - Giá trị rác cũ (vd "cover.png") -> null để UI rơi về ảnh mặc định thay vì ảnh vỡ
 */
export function resolveMediaUrl(value?: string | null): string | null {
    const key = value?.trim();
    if (!key) return null;
    if (ABSOLUTE_URL.test(key)) return key;
    if (key.startsWith('/uploads/')) return `${MEDIA_ORIGIN}${key}`;
    if (key.startsWith('uploads/')) return `${MEDIA_ORIGIN}/${key}`;
    return null;
}