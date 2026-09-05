// TODO: Tích hợp Backend API Contract cho FLASHCARD & QUIZ.
// - Tình trạng: Cơ sở dữ liệu ĐÃ HỖ TRỢ hoàn chỉnh các bảng quiz, quiz_question, flashcard_set, flashcard.
// - Việc cần làm ở Frontend: 
//   1. Bổ sung 'FLASHCARD' và 'QUIZ' vào type `BlockType` trong file `chapterBuilderStore.ts`.
//   2. Mở rộng Payload của API để map dữ liệu từ giao diện vào đúng cấu trúc bảng của Backend.
//   3. Hủy bỏ state cục bộ (stubBlocksByPage) và chuyển Flashcard/Quiz vào luồng quản lý chung của Zustand.

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Center,
  Checkbox,
  Container,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  PasswordInput,
  Textarea,
  FileButton,
  UnstyledButton,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import {
  IconArrowLeft,
  IconWorld,
  IconLock,
  IconKey,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconTrash,
  IconCloudUpload,
  IconPhoto,
  IconMusic,
  IconVideo,
  IconFileText,
  IconPhotoPlus,
  IconCards,
  IconChecklist,
} from '@tabler/icons-react';
import type { AccessType } from '@/features/course-management/types/course-management.types';
import {
  useChapterBuilderStore,
  type BlockDraft,
  type BlockType,
  type MediaBlockDraft,
  type PageDraft,
  type TextBlockDraft,
} from '../store/chapterBuilderStore';
import { useSubmitChapterBuilder } from '../hooks/useSubmitChapterBuilder';
import { useFetchChapterDetail } from '../hooks/useFetchChapterDetail';
import classes from './ChapterBuilderPage.module.css';

const ACCESS_OPTIONS: Array<{
  value: AccessType;
  icon: typeof IconWorld;
  title: string;
  subtitle: string;
}> = [
  { value: 'PUBLIC', icon: IconWorld, title: 'Công khai', subtitle: 'Ai cũng xem được' },
  { value: 'PRIVATE', icon: IconLock, title: 'Đóng', subtitle: 'Chỉ thành viên đã tham gia' },
  { value: 'PROTECTED', icon: IconKey, title: 'Khóa mật mã', subtitle: 'Cần nhập mật mã để vào' },
];

const MEDIA_SUB_TYPES: Array<{
  value: MediaBlockDraft['blockType'];
  label: string;
  icon: typeof IconPhoto;
}> = [
  { value: 'IMAGE', label: 'Ảnh', icon: IconPhoto },
  { value: 'AUDIO', label: 'Âm thanh', icon: IconMusic },
  { value: 'VIDEO', label: 'Video', icon: IconVideo },
];

function acceptFor(blockType: MediaBlockDraft['blockType']) {
  if (blockType === 'IMAGE') return 'image/*';
  if (blockType === 'AUDIO') return 'audio/*';
  return 'video/*';
}

function mediaLabel(blockType: MediaBlockDraft['blockType']) {
  if (blockType === 'IMAGE') return 'ảnh';
  if (blockType === 'AUDIO') return 'âm thanh';
  return 'video';
}

// ---------- Flashcard / Quiz stub types ----------
// `BlockType` trong chapterBuilderStore hiện chỉ có TEXT/IMAGE/VIDEO/AUDIO.
// Flashcard & Quiz là 2 loại block đã có ở phía đọc (page-content: FlashcardBlock/QuizBlock)
// nhưng CHƯA có contract để Creator soạn thảo. Để không đụng vào store (theo yêu cầu),
// 2 khối này được dựng UI ở đây dưới dạng state cục bộ của trang đang active — nhập liệu được,
// nhưng CHƯA nằm trong ChapterDraftSnapshot nên chưa được gửi kèm khi submit.
// TODO: khi store/BE bổ sung FLASHCARD/QUIZ vào BlockType, chuyển state này vào chapterBuilderStore.
interface FlashcardStubBlock {
  localId: string;
  type: 'FLASHCARD';
  front: string;
  back: string;
}

interface QuizAnswerStub {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizStubBlock {
  localId: string;
  type: 'QUIZ';
  question: string;
  answers: QuizAnswerStub[];
}

type StubBlock = FlashcardStubBlock | QuizStubBlock;

// ---------- Block cards ----------

function TextBlockCard({ pageTempId, block }: { pageTempId: string; block: TextBlockDraft }) {
  const updateBlock = useChapterBuilderStore((s) => s.updateBlock);
  const removeBlock = useChapterBuilderStore((s) => s.removeBlock);

  return (
    <Card withBorder shadow="sm" radius="md" p="xl">
      <Group justify="space-between" mb="sm">
        <Group gap={6}>
          <IconFileText size={16} />
          <Text size="sm" fw={600} tt="uppercase" c="dimmed">
            Văn bản
          </Text>
        </Group>
        <ActionIcon
          variant="subtle"
          color="red"
          aria-label="Xóa khối"
          onClick={() => removeBlock(pageTempId, block.blockTempId)}
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Group>

      <Textarea
        placeholder="Nhập nội dung văn bản ở đây..."
        minRows={4}
        autosize
        value={block.contentText}
        onChange={(e) =>
          updateBlock(pageTempId, block.blockTempId, { contentText: e.currentTarget.value })
        }
      />
    </Card>
  );
}

function MediaBlockCard({ pageTempId, block }: { pageTempId: string; block: MediaBlockDraft }) {
  const updateBlock = useChapterBuilderStore((s) => s.updateBlock);
  const removeBlock = useChapterBuilderStore((s) => s.removeBlock);
  const previewUrlRef = useRef<string | null>(null);

  const handlePickFile = (file: File | null) => {
    // Thu hồi object URL cũ trước khi tạo cái mới, tránh rò rỉ bộ nhớ.
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const previewUrl = file ? URL.createObjectURL(file) : null;
    previewUrlRef.current = previewUrl;
    updateBlock(pageTempId, block.blockTempId, { rawFile: file, previewUrl });
  };

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  return (
    <Card withBorder shadow="sm" radius="md" p="xl">
      <Group justify="space-between" mb="sm">
        <Group gap={6}>
          <IconPhotoPlus size={16} />
          <Text size="sm" fw={600} tt="uppercase" c="dimmed">
            Media
          </Text>
        </Group>
        <ActionIcon
          variant="subtle"
          color="red"
          aria-label="Xóa khối"
          onClick={() => removeBlock(pageTempId, block.blockTempId)}
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Group>

      <Group gap="xs" mb="sm">
        {MEDIA_SUB_TYPES.map((sub) => (
          <Button
            key={sub.value}
            size="xs"
            variant="default"
            leftSection={<sub.icon size={14} />}
            classNames={{
              root: `${classes.pill} ${block.blockType === sub.value ? classes.pillActive : ''}`,
            }}
            onClick={() => updateBlock(pageTempId, block.blockTempId, { blockType: sub.value })}
          >
            {sub.label}
          </Button>
        ))}
      </Group>

      <FileButton onChange={handlePickFile} accept={acceptFor(block.blockType)}>
        {(props) => (
          <UnstyledButton {...props} className={classes.dropzone}>
            <IconCloudUpload size={28} stroke={1.5} />
            <Text size="sm">
              {block.rawFile ? block.rawFile.name : `Chọn tệp ${mediaLabel(block.blockType)}...`}
            </Text>
          </UnstyledButton>
        )}
      </FileButton>

      {block.blockType === 'IMAGE' && block.previewUrl && (
        <Box mt="sm">
          <img
            src={block.previewUrl}
            alt="preview"
            style={{ maxHeight: 160, borderRadius: 8, display: 'block' }}
          />
        </Box>
      )}
    </Card>
  );
}

function BlockCard({ pageTempId, block }: { pageTempId: string; block: BlockDraft }) {
  if (block.blockType === 'TEXT') {
    return <TextBlockCard pageTempId={pageTempId} block={block} />;
  }
  return <MediaBlockCard pageTempId={pageTempId} block={block} />;
}

function FlashcardBlockCard({
  block,
  onChange,
  onRemove,
}: {
  block: FlashcardStubBlock;
  onChange: (patch: Partial<Pick<FlashcardStubBlock, 'front' | 'back'>>) => void;
  onRemove: () => void;
}) {
  return (
    <Card withBorder shadow="sm" radius="md" p="xl">
      <Group justify="space-between" mb="sm">
        <Group gap={6}>
          <IconCards size={16} />
          <Text size="sm" fw={600} tt="uppercase" c="dimmed">
            Flashcard
          </Text>
        </Group>
        <ActionIcon variant="subtle" color="red" aria-label="Xóa khối" onClick={onRemove}>
          <IconTrash size={16} />
        </ActionIcon>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <TextInput
          size="md"
          label="Mặt trước"
          placeholder="Nhập nội dung mặt trước..."
          value={block.front}
          onChange={(e) => onChange({ front: e.currentTarget.value })}
        />
        <TextInput
          size="md"
          label="Mặt sau"
          placeholder="Nhập nội dung mặt sau..."
          value={block.back}
          onChange={(e) => onChange({ back: e.currentTarget.value })}
        />
      </SimpleGrid>
    </Card>
  );
}

function QuizBlockCard({
  block,
  onChange,
  onRemove,
}: {
  block: QuizStubBlock;
  onChange: (patch: Partial<Pick<QuizStubBlock, 'question' | 'answers'>>) => void;
  onRemove: () => void;
}) {
  const updateAnswerText = (answerId: string, text: string) => {
    onChange({ answers: block.answers.map((a) => (a.id === answerId ? { ...a, text } : a)) });
  };

  const setCorrectAnswer = (answerId: string) => {
    onChange({ answers: block.answers.map((a) => ({ ...a, isCorrect: a.id === answerId })) });
  };

  const addAnswer = () => {
    onChange({
      answers: [...block.answers, { id: crypto.randomUUID(), text: '', isCorrect: false }],
    });
  };

  const removeAnswer = (answerId: string) => {
    onChange({ answers: block.answers.filter((a) => a.id !== answerId) });
  };

  return (
    <Card withBorder shadow="sm" radius="md" p="xl">
      <Group justify="space-between" mb="sm">
        <Group gap={6}>
          <IconChecklist size={16} />
          <Text size="sm" fw={600} tt="uppercase" c="dimmed">
            Quiz
          </Text>
        </Group>
        <ActionIcon variant="subtle" color="red" aria-label="Xóa khối" onClick={onRemove}>
          <IconTrash size={16} />
        </ActionIcon>
      </Group>

      <TextInput
        size="md"
        label="Đề bài"
        placeholder="Nhập câu hỏi..."
        value={block.question}
        onChange={(e) => onChange({ question: e.currentTarget.value })}
        mb="sm"
      />

      <Stack gap="xs">
        {block.answers.map((answer, index) => (
          <Group key={answer.id} gap="sm" wrap="nowrap" align="center">
            <Checkbox
              size="md"
              checked={answer.isCorrect}
              onChange={() => setCorrectAnswer(answer.id)}
              aria-label="Đáp án đúng"
            />
            <TextInput
              size="md"
              style={{ flex: 1 }}
              placeholder={`Đáp án ${index + 1}`}
              value={answer.text}
              onChange={(e) => updateAnswerText(answer.id, e.currentTarget.value)}
            />
            {block.answers.length > 2 && (
              <ActionIcon
                variant="subtle"
                color="red"
                aria-label="Xóa đáp án"
                onClick={() => removeAnswer(answer.id)}
              >
                <IconTrash size={14} />
              </ActionIcon>
            )}
          </Group>
        ))}
      </Stack>

      <Button
        variant="subtle"
        size="xs"
        mt="xs"
        leftSection={<IconPlus size={14} />}
        onClick={addAnswer}
      >
        Thêm đáp án
      </Button>
    </Card>
  );
}

// ---------- Page tab strip ----------

function PageTabs({
  pages,
  activePageTempId,
}: {
  pages: PageDraft[];
  activePageTempId: string | null;
}) {
  const setActivePage = useChapterBuilderStore((s) => s.setActivePage);
  const addPage = useChapterBuilderStore((s) => s.addPage);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 160, behavior: 'smooth' });
  };

  return (
    <div className={classes.pageTabs}>
      <ActionIcon
        variant="subtle"
        color="gray"
        onClick={() => scrollByAmount(-1)}
        aria-label="Cuộn trái"
      >
        <IconChevronLeft size={16} />
      </ActionIcon>

      <div ref={scrollRef} className={classes.pageTabScroll}>
        {pages.map((page, index) => (
          <UnstyledButton
            key={page.pageTempId}
            className={`${classes.pageTab} ${
              page.pageTempId === activePageTempId ? classes.pageTabActive : ''
            }`}
            onClick={() => setActivePage(page.pageTempId)}
          >
            Trang {index + 1}
          </UnstyledButton>
        ))}

        <UnstyledButton className={classes.pageTab} onClick={addPage}>
          <Group gap={4}>
            <IconPlus size={14} />
            Trang mới
          </Group>
        </UnstyledButton>
      </div>

      <ActionIcon
        variant="subtle"
        color="gray"
        onClick={() => scrollByAmount(1)}
        aria-label="Cuộn phải"
      >
        <IconChevronRight size={16} />
      </ActionIcon>
    </div>
  );
}

// ---------- Main page ----------

export default function ChapterBuilderPage() {
  // Tạo mới: /creator/courses/:courseId/chapters/new
  // Sửa:    /creator/courses/:courseId/chapters/:chapterId/edit
  // -> có chapterId trên URL nghĩa là đang ở luồng Sửa.
  const { courseId: courseIdParam, chapterId: chapterIdParam } = useParams<{
    courseId: string;
    chapterId?: string;
  }>();
  const courseId = Number(courseIdParam);
  const chapterId = chapterIdParam ? Number(chapterIdParam) : null;
  const isEditMode = chapterId !== null;
  const navigate = useNavigate();

  const chapterTitle = useChapterBuilderStore((s) => s.chapterTitle);
  const accessType = useChapterBuilderStore((s) => s.accessType);
  const passcode = useChapterBuilderStore((s) => s.passcode);
  const pages = useChapterBuilderStore((s) => s.pages);
  const activePageTempId = useChapterBuilderStore((s) => s.activePageTempId);
  const removedPageIds = useChapterBuilderStore((s) => s.removedPageIds);
  const removedBlockIds = useChapterBuilderStore((s) => s.removedBlockIds);
  const updateChapterInfo = useChapterBuilderStore((s) => s.updateChapterInfo);
  const addBlock = useChapterBuilderStore((s) => s.addBlock);
  const removePage = useChapterBuilderStore((s) => s.removePage);
  const resetStore = useChapterBuilderStore((s) => s.resetStore);
  const hydrateFromServer = useChapterBuilderStore((s) => s.hydrateFromServer);

  const { mutate: submitChapter, isPending } = useSubmitChapterBuilder();
  const {
    data: chapterDetail,
    isLoading: isLoadingChapterDetail,
    isError: isChapterDetailError,
  } = useFetchChapterDetail(chapterId);

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [stubBlocksByPage, setStubBlocksByPage] = useState<Record<string, StubBlock[]>>({});

  // Chỉ hydrate 1 lần cho mỗi chapterId, tránh việc query refetch ngầm ghi đè bản nháp Creator đang soạn dở.
  const hasHydratedRef = useRef(false);
  // Ghi nhớ accessType gốc lúc mới vào Sửa, để biết chương đã PROTECTED sẵn hay Creator mới đổi sang
  // (quyết định có bắt buộc nhập mật mã mới hay cho phép để trống = giữ mật mã cũ).
  const originalAccessTypeRef = useRef<AccessType | null>(null);

  // Đảm bảo mỗi lần vào trang (Tạo mới hoặc Sửa 1 chapterId khác) đều xuất phát từ store sạch,
  // tránh dính dữ liệu còn sót của phiên trước (vd Creator vừa Sửa chương A xong bấm sang Sửa chương B).
  useEffect(() => {
    resetStore();
    hasHydratedRef.current = false;
  }, [courseId, chapterId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isEditMode && chapterDetail && !hasHydratedRef.current) {
      hydrateFromServer(chapterDetail);
      originalAccessTypeRef.current = chapterDetail.accessType;
      hasHydratedRef.current = true;
    }
  }, [isEditMode, chapterDetail, hydrateFromServer]);

  useEffect(() => {
    if (isChapterDetailError) {
      notifications.show({
        title: 'Không tải được chương',
        message: 'Có lỗi khi lấy dữ liệu chương để sửa. Vui lòng quay lại và thử lại.',
        color: 'red',
      });
    }
  }, [isChapterDetailError]);

  const activePage = pages.find((p) => p.pageTempId === activePageTempId) ?? pages[0] ?? null;
  const activePageIndex = activePage ? pages.indexOf(activePage) : -1;

  const addStubBlock = (pageTempId: string, type: StubBlock['type']) => {
    setStubBlocksByPage((prev) => {
      const existing = prev[pageTempId] ?? [];
      const newBlock: StubBlock =
        type === 'FLASHCARD'
          ? { localId: crypto.randomUUID(), type: 'FLASHCARD', front: '', back: '' }
          : {
              localId: crypto.randomUUID(),
              type: 'QUIZ',
              question: '',
              answers: [
                { id: crypto.randomUUID(), text: '', isCorrect: true },
                { id: crypto.randomUUID(), text: '', isCorrect: false },
              ],
            };
      return { ...prev, [pageTempId]: [...existing, newBlock] };
    });
  };

  const updateStubBlock = (
    pageTempId: string,
    localId: string,
    patch:
      | Partial<Pick<FlashcardStubBlock, 'front' | 'back'>>
      | Partial<Pick<QuizStubBlock, 'question' | 'answers'>>,
  ) => {
    setStubBlocksByPage((prev) => ({
      ...prev,
      [pageTempId]: (prev[pageTempId] ?? []).map((b) =>
        b.localId === localId ? ({ ...b, ...patch } as StubBlock) : b,
      ),
    }));
  };

  const removeStubBlock = (pageTempId: string, localId: string) => {
    setStubBlocksByPage((prev) => ({
      ...prev,
      [pageTempId]: (prev[pageTempId] ?? []).filter((b) => b.localId !== localId),
    }));
  };

  if (isEditMode && isLoadingChapterDetail) {
    return (
      <Center h="60vh">
        <Loader />
      </Center>
    );
  }

  const handleSaveDraft = () => {
    // Chưa có API lưu nháp trong contract -> state đã nằm sẵn trong Zustand suốt phiên làm việc,
    // đây tạm thời chỉ là xác nhận UX. Nối API khi Backend bổ sung endpoint.
    notifications.show({ message: 'Đã lưu nháp' });
  };

  const handleDeletePage = (pageTempId: string) => {
    modals.openConfirmModal({
      title: 'Xóa trang',
      children: <Text size="sm">Bạn có chắc chắn muốn xóa trang này không?</Text>,
      labels: { confirm: 'Xóa trang', cancel: 'Hủy' },
      confirmProps: { color: 'red' },
      onConfirm: () => removePage(pageTempId),
    });
  };

  const handlePublish = () => {
    if (!chapterTitle.trim()) {
      notifications.show({
        title: 'Thiếu tiêu đề',
        message: 'Vui lòng nhập tiêu đề chương.',
        color: 'red',
      });
      return;
    }
    // Luồng Sửa: nếu chương vốn đã PROTECTED từ trước và Creator để trống ô mật mã -> hiểu là giữ
    // nguyên mật mã cũ (BE không trả mật mã thật khi GET). Chỉ bắt buộc nhập mật mã mới khi Tạo mới,
    // hoặc khi Creator vừa đổi từ PUBLIC/PRIVATE sang PROTECTED trong lúc Sửa.
    const isSwitchingToProtected = isEditMode && originalAccessTypeRef.current !== 'PROTECTED';
    const passcodeRequired = accessType === 'PROTECTED' && (!isEditMode || isSwitchingToProtected);
    if (passcodeRequired && !passcode.trim()) {
      notifications.show({
        title: 'Thiếu mật mã',
        message: 'Chương ở chế độ Khóa mật mã cần nhập mật mã truy cập.',
        color: 'red',
      });
      return;
    }
    if (pages.length === 0) {
      notifications.show({
        title: 'Chưa có trang nào',
        message: 'Thêm ít nhất 1 trang trước khi đăng.',
        color: 'red',
      });
      return;
    }

    submitChapter(
      {
        mode: isEditMode ? 'edit' : 'create',
        courseId,
        chapterId,
        draftState: { chapterTitle, accessType, passcode, pages },
        removedPageIds,
        removedBlockIds,
      },
      {
        onSuccess: () => {
          notifications.show({
            title: isEditMode ? 'Cập nhật chương thành công' : 'Đăng chương thành công',
            message: chapterTitle,
            color: 'green',
          });
          resetStore();
          navigate(`/creator/courses/${courseId}`);
        },
        onError: () => {
          notifications.show({
            title: isEditMode ? 'Cập nhật chương thất bại' : 'Đăng chương thất bại',
            message: isEditMode
              ? 'Có lỗi khi lưu thay đổi. Bản nháp vẫn được giữ nguyên, thử lại nhé.'
              : 'Có lỗi khi tạo chương. Bản nháp vẫn được giữ nguyên, thử lại nhé.',
            color: 'red',
          });
        },
      },
    );
  };

  return (
    <Box>
      <Group justify="space-between" px="xl" py="md">
        <ActionIcon
          size="xl"
          variant="subtle"
          color="gray"
          onClick={() => navigate(-1)}
          aria-label="Quay lại"
        >
          <IconArrowLeft size={24} />
        </ActionIcon>

        <Group gap="sm">
          <Button variant="default" onClick={handleSaveDraft}>
            Lưu nháp
          </Button>
          <Button loading={isPending} onClick={handlePublish}>
            {isEditMode ? 'Lưu thay đổi' : 'Đăng chương'}
          </Button>
        </Group>
      </Group>

      <Container size="md">
        <Card withBorder shadow="sm" radius="md" p="xl" mt="md">
          <Text size="sm" fw={700} c="dark" tt="uppercase" mb="sm">
            Thông tin chương
          </Text>

          <TextInput
            variant="unstyled"
            size="xl"
            fw={700}
            placeholder="Chương 1: Nhập tiêu đề chương..."
            value={chapterTitle}
            onChange={(e) => updateChapterInfo({ chapterTitle: e.currentTarget.value })}
            styles={{ input: { fontSize: '24px', fontWeight: 700 } }}
            mb="md"
          />

          <SimpleGrid cols={{ base: 1, sm: 3 }} mb="md">
            {ACCESS_OPTIONS.map((option) => {
              const isActive = accessType === option.value;
              return (
                <UnstyledButton
                  key={option.value}
                  className={`${classes.optionCard} ${isActive ? classes.optionCardActive : ''}`}
                  onClick={() => updateChapterInfo({ accessType: option.value })}
                >
                  <Group gap={8} wrap="nowrap">
                    <option.icon
                      size={18}
                      color={isActive ? 'var(--mantine-color-brand-6)' : undefined}
                    />
                    <div>
                      <Text size="sm" fw={600}>
                        {option.title}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {option.subtitle}
                      </Text>
                    </div>
                  </Group>
                </UnstyledButton>
              );
            })}
          </SimpleGrid>

          {accessType === 'PROTECTED' && (
            <PasswordInput
              label="Mật mã truy cập"
              placeholder={isEditMode ? 'Để trống nếu giữ nguyên mật mã cũ' : 'Nhập mật mã...'}
              description={
                isEditMode && originalAccessTypeRef.current === 'PROTECTED'
                  ? 'Để trống nếu không muốn đổi mật mã hiện tại.'
                  : undefined
              }
              value={passcode}
              onChange={(e) => updateChapterInfo({ passcode: e.currentTarget.value })}
              maw={360}
            />
          )}
        </Card>

        <Box mt={40}>
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="xs">
            Trang trong chương ({pages.length})
          </Text>
          <PageTabs pages={pages} activePageTempId={activePageTempId} />
        </Box>

        {activePage && (
          <Stack mt="md" gap="md">
            <Group justify="space-between">
              <Text fw={700} size="lg">
                Trang {activePageIndex + 1}
              </Text>
              {pages.length > 1 && (
                <Button
                  color="red"
                  variant="subtle"
                  leftSection={<IconTrash size={16} />}
                  onClick={() => handleDeletePage(activePage.pageTempId)}
                >
                  Xóa trang này
                </Button>
              )}
            </Group>

            {activePage.blocks.map((block) => (
              <BlockCard key={block.blockTempId} pageTempId={activePage.pageTempId} block={block} />
            ))}

            {(stubBlocksByPage[activePage.pageTempId] ?? []).map((block) =>
              block.type === 'FLASHCARD' ? (
                <FlashcardBlockCard
                  key={block.localId}
                  block={block}
                  onChange={(patch) => updateStubBlock(activePage.pageTempId, block.localId, patch)}
                  onRemove={() => removeStubBlock(activePage.pageTempId, block.localId)}
                />
              ) : (
                <QuizBlockCard
                  key={block.localId}
                  block={block}
                  onChange={(patch) => updateStubBlock(activePage.pageTempId, block.localId, patch)}
                  onRemove={() => removeStubBlock(activePage.pageTempId, block.localId)}
                />
              ),
            )}

            <Box mt="xl">
              <Button
                variant="default"
                fullWidth
                size="md"
                leftSection={<IconPlus size={16} />}
                onClick={() => setShowAddMenu((v) => !v)}
                style={{ borderStyle: 'dashed', borderWidth: 1.5 }}
              >
                Thêm khối nội dung
              </Button>

              {showAddMenu && (
                <SimpleGrid cols={4} mt="sm">
                  <Button
                    variant="light"
                    size="md"
                    leftSection={<IconFileText size={16} />}
                    onClick={() => {
                      addBlock(activePage.pageTempId, 'TEXT' as BlockType);
                      setShowAddMenu(false);
                    }}
                  >
                    Văn bản
                  </Button>
                  <Button
                    variant="light"
                    size="md"
                    leftSection={<IconPhotoPlus size={16} />}
                    onClick={() => {
                      addBlock(activePage.pageTempId, 'IMAGE' as BlockType);
                      setShowAddMenu(false);
                    }}
                  >
                    Media
                  </Button>
                  <Button
                    variant="light"
                    size="md"
                    leftSection={<IconCards size={16} />}
                    onClick={() => {
                      addStubBlock(activePage.pageTempId, 'FLASHCARD');
                      setShowAddMenu(false);
                    }}
                  >
                    Flashcard
                  </Button>
                  <Button
                    variant="light"
                    size="md"
                    leftSection={<IconChecklist size={16} />}
                    onClick={() => {
                      addStubBlock(activePage.pageTempId, 'QUIZ');
                      setShowAddMenu(false);
                    }}
                  >
                    Quiz
                  </Button>
                </SimpleGrid>
              )}
            </Box>
          </Stack>
        )}
      </Container>
    </Box>
  );
}