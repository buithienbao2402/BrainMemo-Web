import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SimpleGrid, Stack, Loader, Center, Pagination, Text } from '@mantine/core';
import { FilterBar } from '../components/FilterBar';
import { CourseCard } from '../components/CourseCard';
import { useExploreCourses } from '../hooks/useExploreCourse';
import type { ExploreFilters } from '../types/explore.types';

export function ExplorePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<ExploreFilters>({
    search: searchParams.get('search') ?? '',
    sort: (searchParams.get('sort') as ExploreFilters['sort']) ?? 'updated',
    status: (searchParams.get('status') as ExploreFilters['status']) ?? '',
    accessType: (searchParams.get('accessType') as ExploreFilters['accessType']) ?? '',
    tag: searchParams.get('tag') ?? '',
    page: 1,
  });

  useEffect(() => {
    setFilters((f) => ({
      ...f,
      search: searchParams.get('search') ?? '',
      sort: (searchParams.get('sort') as ExploreFilters['sort']) ?? 'updated',
      status: (searchParams.get('status') as ExploreFilters['status']) ?? '',
      page: 1,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const { data, isLoading } = useExploreCourses(filters);

  return (
    <Stack gap="lg" p="lg">
      <FilterBar filters={filters} onChange={(patch) => setFilters((f) => ({ ...f, ...patch, page: 1 }))} />

      {isLoading ? (
        <Center h={200}><Loader color="orange" /></Center>
      ) : !data?.items.length ? (
        <Text c="dimmed" ta="center">Không tìm thấy khóa học phù hợp.</Text>
      ) : (
        <SimpleGrid cols={{ base: 2, sm: 3, lg: 6 }} spacing="md">
          {data.items.map((c) => <CourseCard key={c.courseId} course={c} onClick={() => navigate(`/courses/${c.courseId}`)} />)}
        </SimpleGrid>
      )}

      {data && data.totalPages > 1 && (
        <Pagination value={filters.page} onChange={(page) => setFilters((f) => ({ ...f, page }))} total={data.totalPages} color="orange" />
      )}
    </Stack>
  );
}