import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Anchor,
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Progress,
  RingProgress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  ActionIcon,
} from '@mantine/core';
import {
  IconBrandPython,
  IconEye,
  IconLock,
  IconPencil,
  IconUserPlus,
  IconX,
} from '@tabler/icons-react';
import type {
  CourseDashboardStats,
  CourseInvitation,
} from '../types/course-detail.types';
import { CreateCourseModal, type CourseRecord } from '../components/CreateCourseModal';

interface CourseOverviewTabProps {
  stats: CourseDashboardStats;
  invitations: CourseInvitation[];
}

/**
 * Thông tin mô tả khóa học (tiêu đề, giảng viên, trạng thái, quyền truy cập, ngày tạo).
 * GET /api/courses/{id}/dashboard KHÔNG trả các field này — chúng thuộc
 * GET /api/courses/{id}, nằm ngoài phạm vi 2 API được giao cho tab này.
 * -> Tạm hardcode để khớp UI ảnh mẫu; thay bằng hook thật khi có API course detail.
 *
 * `status`/`accessType`/`description`/`coverImageUrl`/`tags` được thêm vào bên cạnh các label
 * hiển thị (statusLabel/accessLabel) để có đủ dữ liệu mở form Chỉnh sửa (CreateCourseModal) —
 * khi nối GET /api/courses/{id} thật, chỉ cần thay object này bằng data từ hook, phần logic mở
 * modal Sửa bên dưới không cần đổi gì thêm.
 */
const COURSE_META = {
  title: 'Nhập Môn Python - Từ Zero tới Hero',
  description: '', // TODO: chưa có trong bất kỳ API nào ở tab này — thay bằng data thật khi có
  instructorName: 'Thầy Code Dạo',
  statusLabel: 'Đang ra',
  status: 'UPDATING' as const, // TODO: map đúng theo status thật (PAUSED | COMPLETED | UPDATING) khi có API
  accessLabel: 'Private',
  accessType: 'PRIVATE' as const,
  coverImageUrl: null as string | null,
  tags: [] as string[],
  createdAt: '2023-10-20T00:00:00.000Z',
};

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('vi-VN').format(new Date(isoDate));
}

export function CourseOverviewTab({ stats, invitations }: CourseOverviewTabProps) {
  // Route: /creator/courses/:id — tab này không nhận courseId qua props nên lấy thẳng từ URL.
  const { id: courseId } = useParams<{ id: string }>();

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseRecord | null>(null);

  const handleOpenEdit = () => {
    if (!courseId) return;
    setEditingCourse({
      id: courseId,
      title: COURSE_META.title,
      description: COURSE_META.description,
      coverImageUrl: COURSE_META.coverImageUrl,
      tags: COURSE_META.tags,
      accessType: COURSE_META.accessType,
      status: COURSE_META.status,
      createdAt: COURSE_META.createdAt,
    });
    setIsCourseModalOpen(true);
  };

  const handleCloseCourseModal = () => {
    setIsCourseModalOpen(false);
    setEditingCourse(null); // đảm bảo lần sau mở "Tạo mới" (nếu có) form sẽ trống
  };

  const completionRate =
    stats.participantsCount > 0
      ? Math.round((stats.completedCount / stats.participantsCount) * 100)
      : 0;

  return (
    <>
      <Stack gap="lg">
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          {/* Cột trái: thông tin khóa học */}
          <Card withBorder radius="md" padding="lg">
            <Group justify="space-between" align="flex-start" mb="md">
              <Title order={4}>Thông tin khóa học</Title>
              <Group gap={4}>
                <ActionIcon variant="subtle" color="gray" aria-label="Xem trước khóa học">
                  <IconEye size={16} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  aria-label="Sửa khóa học"
                  onClick={handleOpenEdit}
                >
                  <IconPencil size={16} />
                </ActionIcon>
              </Group>
            </Group>
  
            <Group align="flex-start" wrap="nowrap">
              <ThemeIcon size={56} radius="md" color="orange" variant="light">
                <IconBrandPython size={30} />
              </ThemeIcon>
  
              <Stack gap={4} style={{ flex: 1 }}>
                <Text fw={600}>{COURSE_META.title}</Text>
                <Text size="sm" c="dimmed">
                  Bởi {COURSE_META.instructorName}
                </Text>
              </Stack>
            </Group>
  
            <Divider my="md" />
  
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Trạng thái:
                </Text>
                <Badge color="teal" variant="light">
                  {COURSE_META.statusLabel}
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Quyền truy cập:
                </Text>
                <Badge color="orange" variant="light" leftSection={<IconLock size={12} />}>
                  {COURSE_META.accessLabel}
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Ngày tạo:
                </Text>
                <Text size="sm">{formatDate(COURSE_META.createdAt)}</Text>
              </Group>
            </Stack>
          </Card>
  
          {/* Cột giữa: 2 card thống kê */}
          <Stack gap="lg">
            <Card withBorder radius="md" padding="lg" style={{ flex: 1 }}>
              <Text size="sm" c="dimmed">
                Tổng học viên
              </Text>
              <Text fz={32} fw={700}>
                {stats.participantsCount}
              </Text>
            </Card>
            <Card withBorder radius="md" padding="lg" style={{ flex: 1 }}>
              <Text size="sm" c="dimmed">
                Bình luận
              </Text>
              <Text fz={32} fw={700}>
                {stats.commentsCount}
              </Text>
            </Card>
          </Stack>
  
          {/* Cột phải: tỷ lệ hoàn thành */}
          <Card
            withBorder
            radius="md"
            padding="lg"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Stack align="center" gap="xs">
              <Text size="sm" c="dimmed">
                Tỷ lệ hoàn thành
              </Text>
              <RingProgress
                size={140}
                thickness={12}
                roundCaps
                sections={[{ value: completionRate, color: 'orange' }]}
                label={
                  <Text ta="center" fw={700} fz="lg">
                    {completionRate}%
                  </Text>
                }
              />
            </Stack>
          </Card>
        </SimpleGrid>
  
        {/* Danh sách học viên (lời mời đang chờ + học viên đã tham gia) */}
        <Card withBorder radius="md" padding="lg">
          <Group justify="space-between" mb="md">
            <Title order={4}>Danh sách học viên</Title>
            <Button leftSection={<IconUserPlus size={16} />} variant="light" color="orange" size="sm">
              Thêm học viên
            </Button>
          </Group>
  
          {invitations.length > 0 && (
            <>
              <Stack gap="sm">
                {invitations.map((invitation) => (
                  <Group key={invitation.invitationId} justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                      <Avatar radius="xl" color="blue">
                        {invitation.inviteeEmail.charAt(0).toUpperCase()}
                      </Avatar>
                      <Stack gap={0}>
                        <Text size="sm">{invitation.inviteeEmail}</Text>
                        <Text size="xs" c="orange">
                          Đang chờ xác nhận
                        </Text>
                      </Stack>
                    </Group>
                    <ActionIcon variant="subtle" color="gray" aria-label="Hủy lời mời">
                      <IconX size={16} />
                    </ActionIcon>
                  </Group>
                ))}
              </Stack>
              <Divider my="sm" />
            </>
          )}
  
          {stats.students.length === 0 ? (
            <Text size="sm" c="dimmed">
              Chưa có học viên nào tham gia khóa học này.
            </Text>
          ) : (
            <Stack gap="sm">
              <Group wrap="nowrap">
                <Text size="xs" c="dimmed" tt="uppercase" style={{ flex: 1 }}>
                  Học viên
                </Text>
                <Text size="xs" c="dimmed" tt="uppercase" w={180}>
                  Tiến độ
                </Text>
              </Group>
  
              {stats.students.map((student) => (
                <Group key={student.userId} wrap="nowrap">
                  <Avatar src={student.avatarUrl ?? undefined} radius="xl" color="orange">
                    {student.fullName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Text size="sm" style={{ flex: 1 }}>
                    {student.fullName}
                  </Text>
                  <Group gap="xs" w={180} wrap="nowrap">
                    <Progress
                      value={student.progressPercent}
                      color="orange"
                      size="sm"
                      radius="xl"
                      style={{ flex: 1 }}
                    />
                    <Text size="xs" c="dimmed" w={36}>
                      {student.progressPercent}%
                    </Text>
                  </Group>
                </Group>
              ))}
            </Stack>
          )}
  
          <Group justify="flex-end" mt="md">
            <Anchor component="button" type="button" size="sm" c="orange">
              Xem tất cả
            </Anchor>
          </Group>
        </Card>
      </Stack>

      <CreateCourseModal
        opened={isCourseModalOpen}
        onClose={handleCloseCourseModal}
        course={editingCourse}
      />
    </>
  );
}