import { Badge, Group, Paper, Stack, Text } from '@mantine/core';
import type { AccessType, CourseStatus } from '../types/course.types';
import { ACCESS_TYPE_LABEL, COURSE_STATUS_COLOR, COURSE_STATUS_LABEL } from '../utils/courseLabels';
import { formatDateVN } from '../utils/format';

interface CourseInfoBoxProps {
  status: CourseStatus;
  accessType: AccessType;
  createdAt: string;
}

export function CourseInfoBox({ status, accessType, createdAt }: CourseInfoBoxProps) {
  return (
    <Paper shadow="sm" radius="md" p="lg">
      <Text fw={700} mb="sm">
        Thông tin khóa học:
      </Text>

      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Trạng thái:
          </Text>
          <Text size="sm" fw={600} c={COURSE_STATUS_COLOR[status]}>
            {COURSE_STATUS_LABEL[status]}
          </Text>
        </Group>

        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Quyền truy cập:
          </Text>
          <Badge color="orange" variant="light" radius="sm">
            {ACCESS_TYPE_LABEL[accessType]}
          </Badge>
        </Group>

        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Ngày tạo:
          </Text>
          <Text size="sm" fw={600}>
            {formatDateVN(createdAt)}
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
}
