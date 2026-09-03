import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  TagsInput,
  Select,
  PasswordInput,
  Button,
  Group,
  Stack,
  Text,
  Box,
  SimpleGrid,
  Avatar,
  UnstyledButton,
  Paper,
  Image,
  Badge,
  Popover,
  rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconPhoto,
  IconLock,
  IconWorld,
  IconKey,
  IconRefresh,
  IconCalendar,
  IconTrash,
} from '@tabler/icons-react';
import { useAuthStore } from '@/features/auth/store/authStore';

type AccessType = 'PUBLIC' | 'PRIVATE' | 'PROTECTED';
type CourseStatus = 'PAUSED' | 'COMPLETED' | 'UPDATING';

interface CreateCourseFormValues {
  title: string;
  description: string;
  coverImageObjectKey: string;
  tags: string[];
  accessType: AccessType;
  passcode: string;
  status: CourseStatus;
}

/** Dữ liệu khóa học đã tồn tại — truyền vào để bật chế độ Chỉnh sửa. */
export interface CourseRecord {
  id: string;
  title: string;
  description: string;
  coverImageUrl?: string | null;
  tags: string[];
  accessType: AccessType;
  status: CourseStatus;
  createdAt: string; // ISO date string
}

interface CreateCourseModalProps {
  opened: boolean;
  onClose: () => void;
  /** Có giá trị => modal ở chế độ Chỉnh sửa; để trống/undefined => chế độ Tạo mới. */
  course?: CourseRecord | null;
  /** Gọi sau khi xóa khóa học thành công (vd. để dashboard điều hướng ra ngoài, refetch danh sách...). */
  onDeleted?: (courseId: string) => void;
}

const STATUS_OPTIONS: { value: CourseStatus; label: string }[] = [
  { value: 'UPDATING', label: 'Đang cập nhật' },
  { value: 'PAUSED', label: 'Tạm dừng' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
];

const SUGGESTED_TAGS = ['Python', 'JavaScript', 'Beginner', 'Lập trình', 'Web Dev', 'AI', 'Cơ bản', 'Nâng cao'];

const ACCESS_OPTIONS: { value: AccessType; label: string; description: string; icon: typeof IconWorld }[] = [
  { value: 'PUBLIC', label: 'Công khai', description: 'Ai cũng xem được', icon: IconWorld },
  { value: 'PRIVATE', label: 'Riêng tư', description: 'Chỉ mình bạn', icon: IconLock },
  { value: 'PROTECTED', label: 'Bảo vệ', description: 'Cần mã truy cập', icon: IconKey },
];

function generatePasscode(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function revokeIfBlobUrl(url: string | null) {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
}

export function CreateCourseModal({ opened, onClose, course, onDeleted }: CreateCourseModalProps) {
  const user = useAuthStore((s) => s.user);
  const isEditMode = Boolean(course);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CreateCourseFormValues>({
    initialValues: {
      title: '',
      description: '',
      coverImageObjectKey: '',
      tags: [],
      accessType: 'PUBLIC',
      passcode: '',
      status: 'UPDATING',
    },
    validate: {
      title: (value) => (value.trim().length === 0 ? 'Tên khóa học không được để trống' : null),
      passcode: (value, values) => {
        if (values.accessType !== 'PROTECTED') return null;
        const trimmed = value.trim();
        // Chế độ sửa: BE không trả lại passcode cũ vì lý do bảo mật — để trống nghĩa là giữ nguyên,
        // chỉ bắt buộc nhập đủ độ dài nếu người dùng có gõ gì đó.
        if (isEditMode) {
          return trimmed.length > 0 && trimmed.length < 4 ? 'Mã tối thiểu 4 ký tự' : null;
        }
        return trimmed.length < 4 ? 'Bắt buộc nhập khi chọn Protected (tối thiểu 4 ký tự)' : null;
      },
    },
  });

  // Nạp dữ liệu khóa học khi mở modal ở chế độ Chỉnh sửa; reset khi mở ở chế độ Tạo mới.
  useEffect(() => {
    if (!opened) return;
    if (course) {
      form.setValues({
        title: course.title,
        description: course.description,
        coverImageObjectKey: '',
        tags: course.tags,
        accessType: course.accessType,
        passcode: '',
        status: course.status,
      });
      setCoverPreview(course.coverImageUrl ?? null);
    } else {
      form.reset();
      setCoverPreview(null);
    }
    setDeleteConfirmOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, course?.id]);

  // Xóa passcode khi rời PROTECTED
  useEffect(() => {
    if (form.values.accessType !== 'PROTECTED' && form.values.passcode) {
      form.setFieldValue('passcode', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.accessType]);

  const openFilePicker = () => fileInputRef.current?.click();

  const applyCoverFile = (file: File | null) => {
    if (!file) return;
    setCoverPreview((prev) => {
      revokeIfBlobUrl(prev);
      return URL.createObjectURL(file);
    });
    // TODO: wire to features/media-upload -> POST /api/media/presigned-url -> PUT to MinIO,
    // then store the returned objectKey here instead of the raw file name.
    form.setFieldValue('coverImageObjectKey', file.name);
  };

  const clearCover = () => {
    setCoverPreview((prev) => {
      revokeIfBlobUrl(prev);
      return null;
    });
    form.setFieldValue('coverImageObjectKey', '');
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    applyCoverFile(event.target.files?.[0] ?? null);
    event.target.value = ''; // cho phép chọn lại đúng file cũ nếu cần
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    applyCoverFile(event.dataTransfer.files?.[0] ?? null);
  };

  const handleClose = () => {
    if (isSubmitting || isDeleting) return;
    form.reset();
    clearCover();
    setDeleteConfirmOpen(false);
    onClose();
  };

  const handleSubmit = form.onSubmit((values) => {
    setIsSubmitting(true);
    // TODO: thay bằng useMutation (react-query):
    //  - Tạo mới: POST /api/courses
    //  - Chỉnh sửa: PUT /api/courses/{course.id}
    const payload = isEditMode ? { id: course!.id, ...values } : values;
    void new Promise((resolve) => setTimeout(resolve, 800)).then(() => {
      console.log('Submitting course payload:', payload);
      setIsSubmitting(false);
      form.reset();
      clearCover();
      onClose();
    });
  });

  const handleDelete = () => {
    if (!course) return;
    setIsDeleting(true);
    // TODO: thay bằng useMutation (react-query) gọi DELETE /api/courses/{course.id}
    void new Promise((resolve) => setTimeout(resolve, 800)).then(() => {
      console.log('Deleting course:', course.id);
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      onDeleted?.(course.id);
      onClose();
    });
  };

  const createdAtLabel = course
    ? new Date(course.createdAt).toLocaleDateString('vi-VN')
    : new Date().toLocaleDateString('vi-VN');

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={isEditMode ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
      size="lg"
      centered
    >
      {/* noValidate: tránh browser chặn submit bằng popup HTML5 mặc định, để lỗi hiển thị đúng theo Mantine */}
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="md">
          {/* Ảnh bìa khóa học */}
          <Box>
            <Text size="sm" fw={500} mb={2}>
              Ảnh bìa khóa học
            </Text>
            <Text size="xs" c="dimmed" mb={8}>
              Khuyến nghị 1280x720, JPG/PNG &lt;2MB
            </Text>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={handleFileInputChange}
            />

            <Box
              onClick={isSubmitting ? undefined : openFilePicker}
              onDragOver={(event) => {
                event.preventDefault();
                if (!isSubmitting) setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={isSubmitting ? undefined : handleDrop}
              style={{
                border: `1px dashed ${
                  isDragOver ? 'var(--mantine-color-orange-6)' : 'var(--mantine-color-default-border)'
                }`,
                borderRadius: 'var(--mantine-radius-md)',
                backgroundColor: isDragOver ? 'var(--mantine-color-orange-light)' : 'var(--mantine-color-body)',
                cursor: isSubmitting ? 'default' : 'pointer',
                overflow: 'hidden',
                transition: 'border-color 120ms ease, background-color 120ms ease',
              }}
            >
              {coverPreview ? (
                <Image src={coverPreview} h={rem(160)} fit="cover" alt="Ảnh bìa khóa học" />
              ) : (
                <Stack align="center" justify="center" gap={4} py={rem(36)}>
                  <IconPhoto size={28} color="var(--mantine-color-dimmed)" stroke={1.5} />
                  <Text size="sm">Kéo thả hoặc click để tải ảnh bìa</Text>
                  <Text size="xs" c="dimmed">
                    PNG, JPG tối đa 2MB
                  </Text>
                </Stack>
              )}
            </Box>

            <Group mt={8} gap="xs" wrap="nowrap">
              <Button variant="default" style={{ flex: 1 }} onClick={openFilePicker} disabled={isSubmitting}>
                Đổi ảnh bìa
              </Button>
              <Button
                variant="subtle"
                color="red"
                onClick={clearCover}
                disabled={!coverPreview || isSubmitting}
              >
                Xóa ảnh
              </Button>
            </Group>
          </Box>

          {/* Tên khóa học */}
          <TextInput
            label="Tên khóa học"
            placeholder="Nhập môn Python - Từ Zero tới Hero"
            required
            maxLength={100}
            description={`${form.values.title.length}/100`}
            {...form.getInputProps('title')}
          />

          {/* Mô tả khóa học */}
          <Textarea
            label="Mô tả khóa học"
            placeholder="Mô tả ngắn gọn về khóa học... hỗ trợ **in đậm** và _in nghiêng_"
            description="Markdown thin: **đậm**, _nghiêng_, `code`"
            minRows={3}
            autosize
            {...form.getInputProps('description')}
          />

          {/* Người tạo */}
          <Box>
            <Text size="sm" fw={500} mb={4}>
              Người tạo
            </Text>
            <Paper withBorder radius="sm" p="xs" bg="var(--mantine-color-body)">
              <Group justify="space-between">
                <Group gap="sm">
                  <Avatar color="grape" radius="xl" size="sm">
                    {user?.fullName?.slice(0, 2).toUpperCase() ?? 'ND'}
                  </Avatar>
                  <Text size="sm">{user?.fullName ?? 'Bạn'} (Bạn)</Text>
                </Group>
                <IconLock size={16} color="var(--mantine-color-dimmed)" />
              </Group>
            </Paper>
          </Box>

          {/* Tag */}
          <Box>
            <TagsInput label="Tag" placeholder="+ Thêm tag" data={SUGGESTED_TAGS} {...form.getInputProps('tags')} />
            <Group gap={6} mt={8}>
              {SUGGESTED_TAGS.filter((tag) => !form.values.tags.includes(tag)).map((tag) => (
                <Badge
                  key={tag}
                  variant="default"
                  radius="sm"
                  style={{ cursor: 'pointer' }}
                  onClick={() => form.setFieldValue('tags', [...form.values.tags, tag])}
                >
                  + {tag}
                </Badge>
              ))}
            </Group>
          </Box>

          {/* Chế độ truy cập */}
          <Box>
            <Text size="sm" fw={500} mb={8}>
              Chế độ truy cập
            </Text>
            <SimpleGrid cols={3} spacing="sm">
              {ACCESS_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = form.values.accessType === opt.value;
                return (
                  <UnstyledButton
                    key={opt.value}
                    onClick={() => form.setFieldValue('accessType', opt.value)}
                    disabled={isSubmitting}
                  >
                    <Paper
                      withBorder
                      radius="md"
                      p="sm"
                      bg={active ? 'var(--mantine-color-orange-light)' : 'var(--mantine-color-body)'}
                      style={{
                        borderColor: active
                          ? 'var(--mantine-color-orange-6)'
                          : 'var(--mantine-color-default-border)',
                      }}
                    >
                      <Group gap={6} wrap="nowrap">
                        <Icon size={16} color={active ? 'var(--mantine-color-orange-6)' : 'var(--mantine-color-dimmed)'} />
                        <Text size="sm" fw={500} c={active ? 'orange' : undefined}>
                          {opt.label}
                        </Text>
                      </Group>
                      <Text size="xs" c="dimmed" mt={2}>
                        {opt.description}
                      </Text>
                    </Paper>
                  </UnstyledButton>
                );
              })}
            </SimpleGrid>
          </Box>

          {/* Mật mã truy cập — chỉ hiện khi PROTECTED */}
          {form.values.accessType === 'PROTECTED' && (
            <Box>
              <Group gap="xs" align="flex-end">
                <PasswordInput
                  label="Mật mã truy cập (Access Code)"
                  placeholder={isEditMode ? 'Để trống nếu giữ nguyên mã hiện tại' : 'Nhập mã bảo vệ'}
                  required={!isEditMode}
                  style={{ flex: 1 }}
                  {...form.getInputProps('passcode')}
                />
                <Button
                  variant="default"
                  leftSection={<IconRefresh size={14} />}
                  onClick={() => form.setFieldValue('passcode', generatePasscode())}
                >
                  Tạo mã ngẫu nhiên
                </Button>
              </Group>
              {isEditMode && (
                <Text size="xs" c="dimmed" mt={4}>
                  Hệ thống không lưu lại mã cũ — để trống nếu bạn không muốn đổi mã truy cập.
                </Text>
              )}
            </Box>
          )}

          {/* Ngày tạo + Trạng thái */}
          <SimpleGrid cols={2} spacing="sm">
            <TextInput
              label="Ngày tạo"
              value={createdAtLabel}
              leftSection={<IconCalendar size={16} />}
              description="Không sửa được"
              disabled
            />
            <Select
              label="Tình trạng khóa học"
              data={STATUS_OPTIONS}
              allowDeselect={false}
              {...form.getInputProps('status')}
            />
          </SimpleGrid>

          {/* Footer */}
          <Group justify="space-between" mt="md">
            {isEditMode ? (
              <Popover
                opened={deleteConfirmOpen}
                onChange={setDeleteConfirmOpen}
                position="top-start"
                withArrow
                shadow="md"
              >
                <Popover.Target>
                  <Button
                    variant="outline"
                    color="red"
                    leftSection={<IconTrash size={16} />}
                    onClick={() => setDeleteConfirmOpen((o) => !o)}
                    disabled={isSubmitting || isDeleting}
                  >
                    Xóa khóa học
                  </Button>
                </Popover.Target>
                <Popover.Dropdown maw={260}>
                  <Text size="sm" mb={10}>
                    Xóa khóa học này? Toàn bộ chương, trang, học viên và bình luận liên quan sẽ mất vĩnh viễn,
                    không thể khôi phục.
                  </Text>
                  <Group gap="xs" justify="flex-end">
                    <Button size="xs" variant="default" onClick={() => setDeleteConfirmOpen(false)}>
                      Hủy
                    </Button>
                    <Button size="xs" color="red" loading={isDeleting} onClick={handleDelete}>
                      Xóa vĩnh viễn
                    </Button>
                  </Group>
                </Popover.Dropdown>
              </Popover>
            ) : (
              <span />
            )}

            <Group>
              <Button variant="default" onClick={handleClose} disabled={isSubmitting || isDeleting}>
                Hủy
              </Button>
              <Button type="submit" color="orange" loading={isSubmitting} disabled={isDeleting}>
                {isEditMode ? 'Lưu thay đổi' : 'Tạo khóa học'}
              </Button>
            </Group>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}