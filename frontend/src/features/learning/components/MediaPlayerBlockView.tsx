// File: src/features/learning/components/MediaPlayerBlockView.tsx
// Hiển thị block AUDIO / VIDEO bằng thẻ <audio>/<video> gốc của trình duyệt.

import { Box, Text } from '@mantine/core';
import { resolveMediaUrl } from '@/shared/utils/mediaUrl';

interface MediaPlayerBlockViewProps {
    kind: 'AUDIO' | 'VIDEO';
    mediaUrl: string;
    caption?: string | null;
}

export function MediaPlayerBlockView({ kind, mediaUrl, caption }: MediaPlayerBlockViewProps) {
    const src = resolveMediaUrl(mediaUrl);
    if (!src) return null;

    return (
        <Box>
            { kind === 'VIDEO' ? (
            <video
          controls
          preload = "metadata"
    src = { src }
    style = {{ width: '100%', maxHeight: 480, borderRadius: 8, backgroundColor: '#000' }
}
        >
    Trình duyệt của bạn không hỗ trợ phát video.
        </video>
      ) : (
    <audio controls preload = "metadata" src = { src } style = {{ width: '100%' }}>
        Trình duyệt của bạn không hỗ trợ phát âm thanh.
        </audio>
      )}
{
    caption && (
        <Text size="sm" c = "dimmed" ta = "center" fs = "italic" mt = "xs" >
        { caption }
            </Text>
      )
}
</Box>
  );
}