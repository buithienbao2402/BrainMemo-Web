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

interface CreateCourseModalProps {
  opened: boolean;
  onClose: () => void;
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

export function CreateCourseModal({ opened, onClose }: CreateCourseModalProps) {
  const user = useAuthStore((s) => s.user);

  const [isSubmitting, setIsSubmitting] = useState(false);
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
      passcode: (value, values) =>
        values.accessType === 'PROTECTED' && value.trim().length < 4
          ? 'Bắt buộc nhập khi chọn Protected (tối thiểu 4 ký tự)'
          : null,
    },
  });

  // Clear passcode whenever access type leaves PROTECTED
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
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    // TODO: wire to features/media-upload -> POST /api/media/presigned-url -> PUT to MinIO,
    // then store the returned objectKey here instead of the raw file name.
    form.setFieldValue('coverImageObjectKey', file.name);
  };

  const clearCover = () => {
    setCoverPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
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
    if (isSubmitting) return;
    form.reset();
    clearCover();
    onClose();
  };

  const handleSubmit = form.onSubmit((values) => {
    setIsSubmitting(true);
    // TODO: replace with useMutation (react-query) calling POST /api/courses via the shared axios instance
    const payload = { ...values }; // payload sẵn sàng để gửi lên API thật
    void new Promise((resolve) => setTimeout(resolve, 800)).then(() => {
      console.log('Submitting course payload:', payload);
      setIsSubmitting(false);
      form.reset();
      clearCover();
      onClose();
    });
  });

  return (
    <Modal opened={opened} onClose={handleClose} title="Tạo khóa học mới" size="lg" centered>
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
                  placeholder="Nhập mã bảo vệ"
                  required
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
            </Box>
          )}

          {/* Ngày tạo + Trạng thái */}
          <SimpleGrid cols={2} spacing="sm">
            <TextInput
              label="Ngày tạo"
              value={new Date().toLocaleDateString('vi-VN')}
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
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={handleClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" color="orange" loading={isSubmitting}>
              Tạo khóa học
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}