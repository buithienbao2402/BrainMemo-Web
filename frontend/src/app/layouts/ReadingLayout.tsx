// File: src/app/layouts/ReadingLayout.tsx
// Bổ sung 2 Drawer: Mục lục (TOC) và Cài đặt (Settings).
// Quyết định kiến trúc: state "opened" của cả 2 Drawer quản lý NỘI BỘ trong Layout
// (không đẩy ra ngoài như onOpenTableOfContents/onOpenSettings cũ) vì đây thuần là UI state,
// không ảnh hưởng tới data/layer trên. Điều hướng trang (onNavigateToPage) vẫn để component cha
// quyết định, vì đó là business logic (đổi pageId/route).

import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  ActionIcon,
  Progress,
  Text,
  Button,
  Group,
  Box,
  Drawer,
  Stack,
  UnstyledButton,
  Divider,
  Radio,
  Slider,
  ThemeIcon,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconArrowRight,
  IconChevronLeft,
  IconList,
  IconSettings,
  IconCheck,
  IconLock,
} from '@tabler/icons-react';
import classes from './ReadingLayout.module.css';

// Kiểu tối giản cho Mục lục — KHÔNG import trực tiếp PageTabSummary từ features/learning
// để tránh tầng app/layouts phụ thuộc ngược vào tầng features (vi phạm kiến trúc Feature-based).
// Component cha (page-level) tự map dữ liệu contract (mục 7, 8) sang shape này khi truyền prop.
export interface TocPageItem {
  id: number;
  title: string;
  orderIndex: number;
  // isLocked chỉ dùng cho UI hiển thị icon khóa — không phải field mới trong contract,
  // suy ra từ accessType của Chapter (mục 0: PROTECTED = luôn cần passcode).
  isLocked?: boolean;
}

interface ReadingLayoutProps {
  children: ReactNode;

  // Topbar
  courseTitle: string;
  chapterTitle: string;
  progressPercent: number;

  // Footer
  currentPageIndex: number;
  totalPages: number;
  isPrevDisabled?: boolean;
  isNextDisabled?: boolean;

  // Handlers điều hướng — do component cha (page-level) quyết định
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;

  // Dữ liệu cho Drawer Mục lục — optional, nếu không truyền thì Drawer hiện trạng thái rỗng
  tocPages?: TocPageItem[];
  currentPageId?: number;
  onNavigateToPage?: (pageId: number) => void;
}

export function ReadingLayout({
  children,
  courseTitle,
  chapterTitle,
  progressPercent,
  currentPageIndex,
  totalPages,
  isPrevDisabled,
  isNextDisabled,
  onBack,
  onPrev,
  onNext,
  tocPages = [],
  currentPageId,
  onNavigateToPage,
}: ReadingLayoutProps) {
  // 2 state riêng biệt cho 2 Drawer — không dùng chung 1 state kiểu enum vì Mantine Drawer
  // cần unmount/animate độc lập, gộp chung dễ gây race khi đóng Drawer này mở Drawer kia.
  const [tocOpened, setTocOpened] = useState(false);
  const [settingsOpened, setSettingsOpened] = useState(false);

  // ---- State cho Drawer Cài đặt ----
  // fontSize: THUẦN preference hiển thị phía FE (không có field tương ứng trong API_Contract.md)
  // -> chỉ lưu tạm trong state, KHÔNG gọi API. Cần làm rõ với BE nếu muốn persist sau này.
  const [fontSize, setFontSize] = useState(16);
  // readingTheme: map với field "themeMode" đã có sẵn trong contract (mục 3: PUT /api/users/me
  // { ..., themeMode }) -> ở Giai đoạn sau, đổi giá trị này sẽ gọi PUT /api/users/me để persist.
  const [readingTheme, setReadingTheme] = useState<'dark' | 'sepia' | 'light'>('dark');

  const handleNavigate = (pageId: number) => {
    onNavigateToPage?.(pageId);
    setTocOpened(false); // Đóng Drawer ngay sau khi chọn trang, tránh phải bấm thêm 1 lần
  };

  return (
    <div className={classes.layout}>
      <header className={classes.topbar}>
        <Group gap="sm" wrap="nowrap">
          <ActionIcon variant="subtle" color="gray" onClick={onBack} aria-label="Quay lại">
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Box>
            <Text size="sm" fw={600} c="orange.5" lh={1.2}>
              {courseTitle}
            </Text>
            <Text size="xs" c="dimmed" lh={1.2}>
              {chapterTitle}
            </Text>
          </Box>
        </Group>

        <Group gap="xs" className={classes.progressGroup} wrap="nowrap">
          <Text size="xs" c="dimmed">
            {chapterTitle}
          </Text>
          <Progress value={progressPercent} w={140} size="sm" color="orange" radius="xl" />
          <Text size="xs" c="dimmed">
            {progressPercent}%
          </Text>
        </Group>

        <Group gap="xs" wrap="nowrap">
          <Button
            variant="light"
            color="orange"
            size="xs"
            onClick={onNext}
            rightSection={<IconChevronLeft size={14} style={{ transform: 'rotate(180deg)' }} />}
          >
            Chương tiếp
          </Button>
          <ActionIcon variant="subtle" color="gray" onClick={() => setTocOpened(true)} aria-label="Mục lục">
            <IconList size={20} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="gray" onClick={() => setSettingsOpened(true)} aria-label="Cài đặt">
            <IconSettings size={20} />
          </ActionIcon>
        </Group>
      </header>

      <main className={classes.main}>{children}</main>

      <footer className={classes.footer}>
        <Button variant="subtle" color="gray" leftSection={<IconArrowLeft size={16} />} onClick={onPrev} disabled={isPrevDisabled}>
          Trang trước
        </Button>

        <Text size="sm" c="dimmed">
          {currentPageIndex}/{totalPages} Trang
        </Text>

        <Button color="orange" rightSection={<IconArrowRight size={16} />} onClick={onNext} disabled={isNextDisabled}>
          Trang sau
        </Button>
      </footer>

      {/* ---- Drawer: Mục lục ---- */}
      {/* position="right" vì thao tác nhảy trang là tác vụ phụ, không nên che hết flow đọc bên trái */}
      <Drawer
        opened={tocOpened}
        onClose={() => setTocOpened(false)}
        title="Mục lục chương"
        position="right"
        size="sm"
        classNames={{ content: classes.drawerContent, header: classes.drawerHeader }}
      >
        <Stack gap={4}>
          {tocPages.length === 0 && (
            <Text size="sm" c="dimmed">
              Chưa có dữ liệu danh sách trang.
            </Text>
          )}
          {tocPages.map((page) => {
            const isActive = page.id === currentPageId;
            return (
              <UnstyledButton
                key={page.id}
                onClick={() => handleNavigate(page.id)}
                className={`${classes.tocItem} ${isActive ? classes.tocItemActive : ''}`}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="xs" wrap="nowrap">
                    <Text size="xs" c={isActive ? 'orange.5' : 'dimmed'} w={24}>
                      {page.orderIndex}
                    </Text>
                    <Text size="sm" c={isActive ? 'orange.5' : 'gray.3'} fw={isActive ? 600 : 400} lineClamp={1}>
                      {page.title}
                    </Text>
                  </Group>
                  <Group gap={6} wrap="nowrap">
                    {page.isLocked && (
                      <ThemeIcon size="xs" variant="transparent" color="dimmed">
                        <IconLock size={12} />
                      </ThemeIcon>
                    )}
                    {isActive && <IconCheck size={14} color="var(--mantine-color-orange-5)" />}
                  </Group>
                </Group>
              </UnstyledButton>
            );
          })}
        </Stack>
      </Drawer>

      {/* ---- Drawer: Cài đặt ---- */}
      {/* Scaffold cấu hình đọc — logic persist thật (gọi PUT /api/users/me cho themeMode) để dành Giai đoạn sau */}
      <Drawer
        opened={settingsOpened}
        onClose={() => setSettingsOpened(false)}
        title="Cài đặt hiển thị"
        position="right"
        size="xs"
        classNames={{ content: classes.drawerContent, header: classes.drawerHeader }}
      >
        <Stack gap="lg">
          <Box>
            <Text size="sm" fw={500} c="gray.2" mb="xs">
              Cỡ chữ nội dung
            </Text>
            {/* Chỉ ảnh hưởng UI hiển thị (font-size của <main>), chưa persist vì contract chưa có field này */}
            <Slider
              value={fontSize}
              onChange={setFontSize}
              min={14}
              max={22}
              step={1}
              color="orange"
              marks={[{ value: 14, label: 'A' }, { value: 22, label: 'A' }]}
              label={(v) => `${v}px`}
            />
          </Box>

          <Divider color="#2c2e33" />

          <Box>
            <Text size="sm" fw={500} c="gray.2" mb="xs">
              Chủ đề nền đọc
            </Text>
            {/* Map trực tiếp với field themeMode trong PUT /api/users/me (mục 3) */}
            <Radio.Group value={readingTheme} onChange={(v) => setReadingTheme(v as typeof readingTheme)}>
              <Stack gap={8}>
                <Radio value="dark" label="Tối (mặc định)" color="orange" />
                <Radio value="sepia" label="Vàng ngà (đỡ mỏi mắt)" color="orange" />
                <Radio value="light" label="Sáng" color="orange" />
              </Stack>
            </Radio.Group>
          </Box>

          <Text size="xs" c="dimmed">
            * Tùy chọn sẽ được lưu lại vào tài khoản ở phiên bản kế tiếp.
          </Text>
        </Stack>
      </Drawer>
    </div>
  );
}