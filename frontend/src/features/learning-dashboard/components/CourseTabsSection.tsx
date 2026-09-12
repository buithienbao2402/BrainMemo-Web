import { useState } from 'react';
import { Tabs, Stack, Text, SimpleGrid } from '@mantine/core';
import { CourseProgressCard } from './CourseProgressCard';
import { CreatedCourseCard } from './CreatedCourseCard';
import type { LearningDashboardSummary } from '../types/learning-dashboard.types';

export function CourseTabsSection({ courses }: { courses: LearningDashboardSummary['courses'] }) {
  const [tab, setTab] = useState<string | null>('learning');

  return (
    <Tabs value={tab} onChange={setTab} color="dark">
      <Tabs.List mb="md">
        <Tabs.Tab value="learning">Đang học</Tabs.Tab>
        <Tabs.Tab value="completed">Đã hoàn thành</Tabs.Tab>
        <Tabs.Tab value="created">Đã tạo</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="learning">
        {courses.learning.length === 0 ? (
          <Text c="dimmed" size="sm">Chưa có khóa học nào đang học.</Text>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {courses.learning.map((c, i) => <CourseProgressCard key={c.courseId} course={c} index={i} />)}
          </SimpleGrid>
        )}
      </Tabs.Panel>

      <Tabs.Panel value="completed">
        {courses.completed.length === 0 ? (
          <Text c="dimmed" size="sm">Chưa có khóa học nào hoàn thành.</Text>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {courses.completed.map((c, i) => <CourseProgressCard key={c.courseId} course={c} index={i} />)}
          </SimpleGrid>
        )}
      </Tabs.Panel>

      <Tabs.Panel value="created">
        {courses.created.length === 0 ? (
          <Text c="dimmed" size="sm">Chưa tạo khóa học nào.</Text>
        ) : (
          <Stack gap="sm">
            {courses.created.map((c, i) => <CreatedCourseCard key={c.courseId} course={c} index={i} />)}
          </Stack>
        )}
      </Tabs.Panel>
    </Tabs>
  );
}