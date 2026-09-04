import { useParams } from 'react-router-dom';
import { Alert, Card, Skeleton, SimpleGrid, Stack, Tabs, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import {
  useCourseDashboardStats,
  useCourseInvitations,
} from '../hooks/useCourseDetail';
import { CourseOverviewTab } from '../components/CourseOverviewTab';
import { useUIStore } from '@/stores/uiStore';
import { CreateCourseModal } from '../components/CreateCourseModal';
import { ChapterList } from '../components/ChapterList';

/**
 * Trang "Quản lý chi tiết khóa học" (Creator).
 * Route: /creator/courses/:id — chỉ trả nội dung chính, Layout được xử lý ở Router.
 */
export function CourseDetailDashboard() {
  const { id } = useParams<{ id: string }>();
  const courseId = id ?? '';

  const statsQuery = useCourseDashboardStats(courseId);
  const invitationsQuery = useCourseInvitations(courseId);

  const isLoading = statsQuery.isLoading || invitationsQuery.isLoading;
  const isError = statsQuery.isError || invitationsQuery.isError;
  const isCreateCourseModalOpen = useUIStore((s: any) => s.isCreateCourseModalOpen);
  const closeCreateCourseModal = useUIStore((s: any) => s.closeCreateCourseModal);

  return (
    <>
      <Tabs defaultValue="overview" color="orange">
        <Tabs.List>
          <Tabs.Tab value="overview">Tổng quan khóa học</Tabs.Tab>
          <Tabs.Tab value="chapters">Danh sách chương</Tabs.Tab>
          <Tabs.Tab value="new-chapter">Thêm chương mới</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="lg">
          {isError && (
            <Alert
              color="red"
              icon={<IconAlertCircle size={16} />}
              title="Không tải được dữ liệu"
            >
              Đã có lỗi xảy ra khi tải thông tin khóa học. Vui lòng thử lại.
            </Alert>
          )}

          {!isError && isLoading && <CourseOverviewSkeleton />}

          {!isError && !isLoading && statsQuery.data && (
            <CourseOverviewTab
              stats={statsQuery.data}
              invitations={invitationsQuery.data ?? []}
            />
          )}
        </Tabs.Panel>

        <Tabs.Panel value="chapters" pt="lg">
          <ChapterList />
        </Tabs.Panel>

        <Tabs.Panel value="new-chapter" pt="lg">
          <Text c="dimmed" size="sm">
            Thêm chương mới — nằm ngoài phạm vi nhiệm vụ hiện tại.
          </Text>
        </Tabs.Panel>
      </Tabs>

      <CreateCourseModal opened={isCreateCourseModalOpen} onClose={closeCreateCourseModal} />
    </>
  );
}

function CourseOverviewSkeleton() {
  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        <Skeleton height={180} radius="md" />
        <Skeleton height={180} radius="md" />
        <Skeleton height={180} radius="md" />
      </SimpleGrid>
      <Card withBorder radius="md" padding="lg">
        <Skeleton height={20} width="30%" mb="md" />
        <Skeleton height={40} mb="sm" />
        <Skeleton height={40} mb="sm" />
        <Skeleton height={40} />
      </Card>
    </Stack>
  );
}