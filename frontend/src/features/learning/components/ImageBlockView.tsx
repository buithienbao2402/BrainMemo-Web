// File: src/features/learning/components/ImageBlockView.tsx
// Hiển thị block IMAGE: bo góc, scale vừa khung đọc, có caption (lưu trong contentText) nếu có.

import { Image, Text } from '@mantine/core';
import { resolveMediaUrl } from '@/shared/utils/mediaUrl';

interface ImageBlockViewProps {
    mediaUrl: string;
    caption?: string | null;
}

export function ImageBlockView({ mediaUrl, caption }: ImageBlockViewProps) {
    const src = resolveMediaUrl(mediaUrl);
    if (!src) return null;

    return (
        <figure style= {{ margin: 0 }
}>
    <Image
        src={ src }
alt = { caption ?? 'Hình ảnh minh họa'}
radius = "md"
fit = "contain"
mah = { 480} // Giới hạn chiều cao để ảnh không chiếm hết viewport trên màn nhỏ
mx = "auto"
style = {{
    border: '1px solid #2c2e33',
        boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
        }}
      />
{
    caption && (
        <Text size="sm" c = "dimmed" ta = "center" fs = "italic" mt = "xs" >
        { caption }
            </Text>
      )
}
</figure>
  );
}