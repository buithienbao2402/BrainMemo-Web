import { useMemo, useState } from 'react';
import { TextInput, Stack, Group, Text, Chip } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useTags } from '../hooks/useTags';
import type { ExploreFilters } from '../types/explore.types';

const SORT_OPTIONS: { value: ExploreFilters['sort'] | ''; label: string; disabled?: boolean }[] = [
  { value: 'updated', label: 'Mới cập nhật' },
  { value: 'newest', label: 'Mới ra mắt' },
  { value: 'participants', label: 'Tổng người tham gia' },
  { value: '', label: 'Số người học theo tuần', disabled: true },
  { value: '', label: 'Số người học theo ngày', disabled: true },
  { value: 'comments', label: 'Tổng lượt bình luận' },
];

const ACCESS_OPTIONS = [
  { value: '', label: 'Tất cả' }, { value: 'PUBLIC', label: 'Public' },
  { value: 'PRIVATE', label: 'Private' }, { value: 'PROTECTED', label: 'Protected' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' }, { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'UPDATING', label: 'Đang ra' }, { value: 'PAUSED', label: 'Tạm ngưng' },
];

interface FilterBarProps { filters: ExploreFilters; onChange: (patch: Partial<ExploreFilters>) => void; }

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const { data: tags } = useTags();

  // #Tag-filter: ô tìm kiếm CHỈ lọc danh sách chip đang hiển thị (client-side),
  // KHÔNG gọi API -> để state riêng, không đưa vào ExploreFilters.
  const [tagSearch, setTagSearch] = useState('');

  const visibleTags = useMemo(() => {
    if (!tags) return [];
    const q = tagSearch.trim().toLowerCase();
    if (!q) return tags;
    return tags.filter((t) => t.toLowerCase().includes(q));
  }, [tags, tagSearch]);

  const toggleTag = (tag: string) => {
    const isSelected = filters.tags.includes(tag);
    const nextTags = isSelected ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag];
    onChange({ tags: nextTags });
  };

  return (
    <Stack gap="md">
      <TextInput placeholder="Tìm trong tên, tác giả" value={filters.search} onChange={(e) => onChange({ search: e.currentTarget.value })} />

      <Group gap="xs">
        <Text size="sm" w={90}>Sắp xếp:</Text>
        {SORT_OPTIONS.map((opt) => (
          <Chip key={opt.label} checked={opt.value !== '' && filters.sort === opt.value} disabled={opt.disabled}
            onChange={() => !opt.disabled && onChange({ sort: opt.value as ExploreFilters['sort'] })} color="orange" variant="outline">
            {opt.label}
          </Chip>
        ))}
      </Group>

      <Group gap="xs">
        <Text size="sm" w={90}>Loại khóa học:</Text>
        {ACCESS_OPTIONS.map((opt) => (
          <Chip key={opt.value} checked={filters.accessType === opt.value} onChange={() => onChange({ accessType: opt.value as ExploreFilters['accessType'] })} color="orange" variant="outline">
            {opt.label}
          </Chip>
        ))}
      </Group>

      <Group gap="xs">
        <Text size="sm" w={90}>Trạng thái:</Text>
        {STATUS_OPTIONS.map((opt) => (
          <Chip key={opt.value} checked={filters.status === opt.value} onChange={() => onChange({ status: opt.value as ExploreFilters['status'] })} color="orange" variant="outline">
            {opt.label}
          </Chip>
        ))}
      </Group>

      <Stack gap={6}>
        <Group gap="xs">
          <Text size="sm" w={90}>Nhãn dán:</Text>
          <TextInput
            placeholder="Tìm tag..."
            leftSection={<IconSearch size={14} />}
            size="xs"
            w={180}
            value={tagSearch}
            onChange={(e) => setTagSearch(e.currentTarget.value)}
          />
          {visibleTags.map((tag) => (
            <Chip key={tag} checked={filters.tags.includes(tag)} onChange={() => toggleTag(tag)} color="orange" variant="outline">
              {tag}
            </Chip>
          ))}
          {tags && tags.length > 0 && visibleTags.length === 0 && (
            <Text size="xs" c="dimmed">Không tìm thấy tag phù hợp.</Text>
          )}
        </Group>

        {filters.tags.length > 0 && (
          <Text size="xs" c="orange" ml={98} style={{ cursor: 'pointer' }} onClick={() => onChange({ tags: [] })}>
            Bỏ chọn tất cả ({filters.tags.length} tag đã chọn)
          </Text>
        )}
      </Stack>
    </Stack>
  );
}