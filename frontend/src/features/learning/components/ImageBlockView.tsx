// File: src/features/learning/components/ImageBlockView.tsx
// Hiển thị block IMAGE: bo góc, scale vừa khung đọc (maw 100%), có shadow nhẹ tạo chiều sâu.

import { Image } from '@mantine/core';

interface ImageBlockViewProps {
  mediaUrl: string;
}

export function ImageBlockView({ mediaUrl }: ImageBlockViewProps) {
  return (
    <Image
      src={mediaUrl}
      radius="md"
      fit="contain"
      mah={480} // Giới hạn chiều cao để ảnh không chiếm hết viewport trên màn nhỏ
      mx="auto"
      mb="md"
      style={{
        border: '1px solid #2c2e33',
        boxShadow: '0 4px 16px rgba(0,0,0,0.35)', // Shadow tối phù hợp dark mode, tránh viền cứng
      }}
    />
  );
}