import { Stack, SimpleGrid, Card, Group, Text, Badge, ThemeIcon, Skeleton } from '@mantine/core';
import {
  IconBook2,
  IconUsers,
  IconBrandPython,
  IconMathFunction,
  IconMessageCircle,
  IconAtom,
  IconBulb,
  IconBrandJavascript,
  type Icon,
} from '@tabler/icons-react';
import { CourseDashboardLayout } from '@/app/layouts/CourseDashboardLayout';
import { useUIStore } from '@/stores/uiStore';
import { useMyCourses } from '../hooks/useCourseManagement';
import { CreateCourseModal } from '../components/CreateCourseModal';
import type { Course, CourseStatus } from '../types/course-management.types';
import { useNavigate } from 'react-router-dom';

// Mock: chưa có endpoint stats tổng học viên toàn nền tảng, hardcode tạm theo thiết kế.
const MOCK_TOTAL_PARTICIPANTS = 4321;

const STATUS_META: Record<CourseStatus, { label: string; color: string }> = {
  UPDATING: { label: 'ĐANG RA', color: 'orange' },
  COMPLETED: { label: 'HOÀN THÀNH', color: 'green' },
  PAUSED: { label: 'TẠM DỪNG', color: 'gray' },
};

// UI-only: icon/màu theo thứ tự hiển thị, không nằm trong dữ liệu backend.
const COURSE_VISUALS: Array<{ icon: Icon; color: string }> = [
  { icon: IconBrandPython, color: 'teal' },
  { icon: IconMathFunction, color: 'indigo' },
  { icon: IconMessageCircle, color: 'teal' },
  { icon: IconAtom, color: 'violet' },
  { icon: IconBulb, color: 'pink' },
  { icon: IconBrandJavascript, color: 'yellow' },
];

function formatParticipants(count: number) {
  return count >= 1000 ? `${Math.round(count / 1000)}K` : String(count);
}

function CourseRow({ course, index }: { course: Course; index: number }) {
  const visual = COURSE_VISUALS[index % COURSE_VISUALS.length];
  const status = STATUS_META[course.status];

  return (
    <Group justify="space-between" py="sm">
      <Group gap="md">
        <ThemeIcon size={40} radius="md" color={visual.color}>
          <visual.icon size={20} />
        </ThemeIcon>
        <div>
          <Text fw={600} size="sm">
            {course.title}
          </Text>
          <Text size="xs" c="dimmed">
            {course.chapterCount} chương · {formatParticipants(course.participantsCount)} students
          </Text>
        </div>
      </Group>

      <Badge color={status.color} variant="light">
        {status.label}
      </Badge>
    </Group>
  );
}

export default function CreatorDashboard() {
  const { data, isLoading } = useMyCourses();
  const isCreateCourseModalOpen = useUIStore((s) => s.isCreateCourseModalOpen);
  const closeCreateCourseModal = useUIStore((s) => s.closeCreateCourseModal);
  const navigate = useNavigate();

  return (
    <CourseDashboardLayout>
      <Stack gap="xl" maw={960} mx="auto">
        <Text fz={22} fw={700}>
          🚀 Creator Dashboard
        </Text>

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Card radius="md" padding="lg" withBorder>
            <ThemeIcon variant="light" color="brand" size={36} radius="md" mb="sm">
              <IconBook2 size={20} />
            </ThemeIcon>
            {isLoading ? (
              <Skeleton height={28} width={60} />
            ) : (
              <Text fz={28} fw={700}>
                {data?.totalItems ?? 0}
              </Text>
            )}
            <Text size="sm" c="dimmed">
              Tổng khóa học
            </Text>
          </Card>

          <Card radius="md" padding="lg" withBorder>
            <ThemeIcon variant="light" color="blue" size={36} radius="md" mb="sm">
              <IconUsers size={20} />
            </ThemeIcon>
            {isLoading ? (
              <Skeleton height={28} width={90} />
            ) : (
              <Text fz={28} fw={700}>
                {MOCK_TOTAL_PARTICIPANTS.toLocaleString('vi-VN')}
              </Text>
            )}
            <Text size="sm" c="dimmed">
              Học viên
            </Text>
          </Card>
        </SimpleGrid>

        <Card radius="md" padding="lg" withBorder>
          <Text fw={600} mb="sm">
            Khóa học của tôi
          </Text>

          {isLoading ? (
            <Stack gap="sm">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} height={56} radius="md" />
              ))}
            </Stack>
          ) : (
            <Stack gap={0}>
              {data?.items.map((course, index) => (
                <div
                  key={course.id}
                  onClick={() => navigate(`/creator/courses/${course.id}`)}
                  style={
                    index < (data.items.length ?? 0) - 1
                      ? { borderBottom: '1px solid var(--mantine-color-gray-2)', cursor: 'pointer' }
                      : { cursor: 'pointer' }
                  }
                >
                  <CourseRow course={course} index={index} />
                </div>
              ))}
            </Stack>
          )}
        </Card>
      </Stack>

      <CreateCourseModal opened={isCreateCourseModalOpen} onClose={closeCreateCourseModal} />
    </CourseDashboardLayout>
  );
}