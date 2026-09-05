// File: src/features/learning/components/TextBlockView.tsx
// Hiển thị block TEXT: parse thô chuỗi markdown (chỉ xử lý heading "## " và code fence ```lang)
// vì contentText hiện tại chỉ dùng 2 cú pháp này (theo mock Giai đoạn 1) — không kéo thêm
// thư viện markdown ngoài để giữ Giai đoạn 2 tối giản.

import { useState } from 'react';
import { Box, Text, Title, ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import classes from './TextBlockView.module.css';

interface TextBlockViewProps {
  contentText: string;
}

// Segment sau khi parse: đoạn văn bản thường hoặc đoạn code kèm ngôn ngữ.
type Segment = { type: 'text'; content: string } | { type: 'code'; lang: string; content: string };

// Tách contentText thành các segment text/code dựa trên fence ```lang ... ```
function parseContent(raw: string): Segment[] {
  const fenceRegex = /```(\w*)\n([\s\S]*?)```/g;
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = fenceRegex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: raw.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'code', lang: match[1] || 'text', content: match[2].replace(/\n$/, '') });
    lastIndex = fenceRegex.lastIndex;
  }
  if (lastIndex < raw.length) {
    segments.push({ type: 'text', content: raw.slice(lastIndex) });
  }
  return segments;
}

// Render đoạn text thường: dòng bắt đầu "## " -> Title, còn lại -> Text đoạn văn
function TextSegment({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/).filter((b) => b.trim().length > 0);

  return (
    <>
      {blocks.map((block, i) => {
        if (block.startsWith('## ')) {
          return (
            <Title key={i} order={3} c="gray.1" mb="xs">
              {block.replace('## ', '')}
            </Title>
          );
        }
        return (
          <Text key={i} c="gray.4" mb="md" style={{ lineHeight: 1.7 }}>
            {block}
          </Text>
        );
      })}
    </>
  );
}

// Khối code: header xám đen ghi tên ngôn ngữ + nút Copy, body monospace nền tối hơn (đúng ảnh Figma)
function CodeSegment({ lang, content }: { lang: string; content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // Tự reset icon sau 1.5s
  };

  return (
    <Box className={classes.codeBlock} mb="md">
      <Group justify="space-between" className={classes.codeHeader}>
        <Text size="xs" c="dimmed" tt="lowercase">
          {lang}
        </Text>
        <Tooltip label={copied ? 'Đã sao chép' : 'Sao chép'} withArrow>
          <ActionIcon variant="subtle" color="gray" size="sm" onClick={handleCopy}>
            {copied ? <IconCheck size={14} color="var(--mantine-color-green-5)" /> : <IconCopy size={14} />}
          </ActionIcon>
        </Tooltip>
      </Group>
      <Box component="pre" className={classes.codePre}>
        <code>{content}</code>
      </Box>
    </Box>
  );
}

export function TextBlockView({ contentText }: TextBlockViewProps) {
  const segments = parseContent(contentText);

  return (
    <Box>
      {segments.map((seg, i) =>
        seg.type === 'text' ? <TextSegment key={i} content={seg.content} /> : <CodeSegment key={i} lang={seg.lang} content={seg.content} />
      )}
    </Box>
  );
}