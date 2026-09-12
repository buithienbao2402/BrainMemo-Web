import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SimpleGrid, Stack, Loader, Center, Pagination, Text } from '@mantine/core';
import { FilterBar } from '../components/FilterBar';
import { CourseCard } from '../components/CourseCard';
import { useExploreCourses } from '../hooks/useExploreCourse';
import type { ExploreFilters } from '../types/explore.types';

function parseTagsParam(params: URLSearchParams): string[] {
  return (params.get('tags') ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams(); // Thêm setSearchParams
  const navigate = useNavigate();

  const [filters, setFilters] = useState<ExploreFilters>({
    search: searchParams.get('search') ?? '',
    sort: (searchParams.get('sort') as ExploreFilters['sort']) ?? 'updated',
    status: (searchParams.get('status') as ExploreFilters['status']) ?? '',
    accessType: (searchParams.get('accessType') as ExploreFilters['accessType']) ?? '',
    tags: parseTagsParam(searchParams),
    page: 1,
  });

  useEffect(() => {
    setFilters({
      search: searchParams.get('search') ?? '',
      sort: (searchParams.get('sort') as ExploreFilters['sort']) ?? 'updated',
      status: (searchParams.get('status') as ExploreFilters['status']) ?? '',
      accessType: (searchParams.get('accessType') as ExploreFilters['accessType']) ?? '',
      tags: parseTagsParam(searchParams),
      page: Number(searchParams.get('page')) || 1, // Đọc cả page từ URL nếu có
    });
  }, [searchParams]);

  const { data, isLoading } = useExploreCourses(filters);

  // HÀM MỚI: Xử lý khi filter thay đổi -> Cập nhật URL thay vì chỉ cập nhật State
  const handleFilterChange = (patch: Partial<ExploreFilters>) => {
    const newParams = new URLSearchParams(searchParams);

    // Merge các patch mới vào params hiện tại
    Object.entries(patch).forEach(([key, value]) => {
      if (key === 'tags') {
        const tagArray = value as string[];
        if (tagArray.length > 0) {
          newParams.set('tags', tagArray.join(',')); // Nối bằng dấu phẩy
        } else {
          newParams.delete('tags');
        }
      } else if (value) {
        newParams.set(key, String(value));
      } else {
        newParams.delete(key);
      }
    });

    // Luôn reset về trang 1 khi đổi filter (trừ khi patch có chứa 'page')
    if (!patch.page) {
      newParams.set('page', '1');
    }

    setSearchParams(newParams); // Đẩy lên URL -> Sẽ kích hoạt lại useEffect ở trên
  };

  return (
    <Stack gap="lg" p="lg">
      {/* TRUYỀN HÀM MỚI VÀO onChange */}
      <FilterBar filters={filters} onChange={handleFilterChange} />

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
        <Pagination 
           value={filters.page} 
           onChange={(page) => handleFilterChange({ page })} // Sửa lại onChange của pagination
           total={data.totalPages} 
           color="orange" 
        />
      )}
    </Stack>
  );
}