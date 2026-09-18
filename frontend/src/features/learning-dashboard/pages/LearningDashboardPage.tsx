import { Box, Grid, Stack, Loader, Center } from '@mantine/core';
import { useLearningDashboard } from '../hooks/useLearningDashboard';
import { ProfileSidebarCard } from '../components/ProfileSidebarCard';
import { CourseTabsSection } from '../components/CourseTabsSection';
import { ActivityStatsBanner } from '../components/ActivityStatsBanner';

export function LearningDashboardPage() {
  const { data, isLoading } = useLearningDashboard();

  if (isLoading || !data) {
    return <Center h={300}><Loader color="orange" /></Center>;
  }

  return (
    <Box p="lg">
      <Grid styles={{ root: { '--grid-gutter': 'var(--mantine-spacing-lg)' } }}>
        <Grid.Col span={{ base: 12, md: 3 }}>
          <ProfileSidebarCard data={data} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 9 }}>
          <Stack gap="lg">
            <CourseTabsSection courses={data.courses} />
            <ActivityStatsBanner totalActiveSeconds={data.totalActiveSeconds} commentsCount={data.commentsCount} />
          </Stack>
        </Grid.Col>
      </Grid>
    </Box>
  );
}