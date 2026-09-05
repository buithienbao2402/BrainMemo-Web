import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CourseDetail,
} from '../types/course-detail.types';
import { CreateCourseModal, type CourseRecord } from '../components/CreateCourseModal';

interface CourseOverviewTabProps {
  course: CourseDetail;
  stats: CourseDashboardStats;
  invitations: CourseInvitation[];
}

/** Thông tin cũ (trước khi xóa mock data):
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

export function CourseOverviewTab({ course, stats, invitations }: CourseOverviewTabProps) {
  // Route: /creator/courses/:id — tab này không nhận courseId qua props nên lấy thẳng từ URL.

  const navigate = useNavigate();

  const STATUS_LABELS: Record<CourseDetail['status'], string> = {
    UPDATING: 'Đang ra',
    PAUSED: 'Tạm dừng',
    COMPLETED: 'Đã hoàn thành',
  };

  const ACCESS_LABELS: Record<CourseDetail['accessType'], string> = {
    PUBLIC: 'Public',
    PRIVATE: 'Private',
    PROTECTED: 'Protected',
  };

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseRecord | null>(null);

  const handleOpenEdit = () => {
    setEditingCourse({
      id: String(course.courseId),
      title: course.title,
      description: course.description ?? '',
      coverImageUrl: course.coverImageUrl,
      tags: course.tags,
      accessType: course.accessType,
      status: course.status,
      createdAt: course.createdAt,
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
                <Text fw={600}>{course.title}</Text>
                <Text size="sm" c="dimmed">
                  Bởi {course.creator.fullName}
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
                  {STATUS_LABELS[course.status]}
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Quyền truy cập:
                </Text>
                <Badge color="orange" variant="light" leftSection={<IconLock size={12} />}>
                  {ACCESS_LABELS[course.accessType]}
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Ngày tạo:
                </Text>
                <Text size="sm">{course.createdAt}</Text>
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
        onDeleted={() => navigate('/creator/dashboard')} // điều hướng ra ngoài vì course đã bị xóa, ở lại trang sẽ 404
      />
    </>
  );
}