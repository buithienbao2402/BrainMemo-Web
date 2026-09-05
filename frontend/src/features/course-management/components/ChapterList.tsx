import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Tabs,
  Table,
  ActionIcon,
  ThemeIcon,
  Text,
  Group,
  Modal,
  Button,
  Skeleton,
  Stack,
  Center,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconEye, IconTrash, IconWorld, IconLock, IconFileOff, IconPencil } from '@tabler/icons-react';
import { useCourseChapters, useDeleteChapter } from '../hooks/useCourseChapters';
import type { Chapter } from '../types/course-detail.types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN');
}

function AccessBadge({ accessType }: { accessType: Chapter['accessType'] }) {
  if (accessType === 'PUBLIC') {
    return (
      <ThemeIcon color="green" variant="light" radius="xl" size={28}>
        <IconWorld size={16} />
      </ThemeIcon>
    );
  }
  // PRIVATE và PROTECTED dùng chung 1 icon khóa xám theo đúng thiết kế
  return (
    <ThemeIcon color="gray" variant="light" radius="xl" size={28}>
      <IconLock size={16} />
    </ThemeIcon>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Center py="xl">
      <Stack align="center" gap={4}>
        <ThemeIcon variant="light" color="gray" size={48} radius="xl">
          <IconFileOff size={24} />
        </ThemeIcon>
        <Text fw={600}>{title}</Text>
        <Text size="sm" c="dimmed">
          {description}
        </Text>
      </Stack>
    </Center>
  );
}

export function ChapterList() {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const navigate = useNavigate();

  const { data: chapters, isLoading } = useCourseChapters(courseId);
  const { mutate: deleteChapter, isPending: isDeleting } = useDeleteChapter(courseId);

  const [confirmOpened, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);
  const [targetChapter, setTargetChapter] = useState<Chapter | null>(null);

  const handleAskDelete = (chapter: Chapter) => {
    setTargetChapter(chapter);
    openConfirm();
  };

  const handleConfirmDelete = () => {
    if (!targetChapter) return;

    deleteChapter(targetChapter.id, {
      onSuccess: () => {
        notifications.show({
          title: 'Đã xóa chương',
          message: `"${targetChapter.title}" đã được xóa.`,
          color: 'green',
        });
        closeConfirm();
        setTargetChapter(null);
      },
      onError: () => {
        notifications.show({
          title: 'Có lỗi xảy ra',
          message: 'Không thể xóa chương. Vui lòng thử lại.',
          color: 'red',
        });
      },
    });
  };

  return (
    <>
      <Tabs defaultValue="published">
        <Tabs.List mb="md">
          <Tabs.Tab value="published">Danh sách chương</Tabs.Tab>
          <Tabs.Tab value="draft">Chương nháp</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="published">
          {isLoading ? (
            <Stack gap="xs">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} height={44} radius="sm" />
              ))}
            </Stack>
          ) : !chapters || chapters.length === 0 ? (
            <EmptyState
              title="Chưa có chương nào"
              description='Bấm "Thêm chương mới" để bắt đầu tạo nội dung.'
            />
          ) : (
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={60}>STT</Table.Th>
                  <Table.Th>Tên chương</Table.Th>
                  <Table.Th w={120}>Truy cập</Table.Th>
                  <Table.Th w={140}>Ngày đăng</Table.Th>
                  <Table.Th w={120} ta="center" >Thao tác</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {chapters.map((chapter, index) => (
                  <Table.Tr key={chapter.id}>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        #{index + 1}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {chapter.title}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <AccessBadge accessType={chapter.accessType} />
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {formatDate(chapter.createdAt)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6} wrap="nowrap" justify="center">
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          aria-label="Xem chương"
                          onClick={() => navigate(`/courses/${courseId}/learn/${chapter.id}`)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>

                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          aria-label="Sửa chương"
                          onClick={() => navigate(`/creator/courses/${courseId}/chapters/${chapter.id}/edit`)}
                        >
                          <IconPencil size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          aria-label="Xóa chương"
                          onClick={() => handleAskDelete(chapter)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="draft">
          <EmptyState
            title="Chưa có chương nháp nào"
            description="Các chương đang soạn dở sẽ hiện ở đây."
          />
        </Tabs.Panel>
      </Tabs>

      <Modal opened={confirmOpened} onClose={closeConfirm} title="Xóa chương học" centered>
        <Text size="sm">
          Bạn có chắc muốn xóa chương{' '}
          <Text span fw={600}>
            "{targetChapter?.title}"
          </Text>
          ? Toàn bộ trang và nội dung bên trong chương này cũng sẽ bị xóa.
        </Text>
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={closeConfirm}>
            Hủy
          </Button>
          <Button color="red" loading={isDeleting} onClick={handleConfirmDelete}>
            Xóa chương
          </Button>
        </Group>
      </Modal>
    </>
  );
}