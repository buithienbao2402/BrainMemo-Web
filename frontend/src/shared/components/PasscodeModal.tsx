// frontend/src/shared/components/PasscodeModal.tsx
import { useEffect, useState } from 'react';
import { Modal, PasswordInput, Button, Stack, Text, Group } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';

interface PasscodeModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (passcode: string) => void;
  isInvalid?: boolean;
  title?: string;
}

export function PasscodeModal({
  opened,
  onClose,
  onSubmit,
  isInvalid,
  title = 'Nội dung được bảo vệ',
}: PasscodeModalProps) {
  const [value, setValue] = useState('');

  // Xóa input mỗi lần modal mở lại (kể cả khi mở lại do nhập sai lần trước)
  useEffect(() => {
    if (opened) setValue('');
  }, [opened]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
  };

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered closeOnClickOutside={false}>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Group gap={8} wrap="nowrap" align="flex-start">
            <IconLock size={18} color="var(--mantine-color-orange-6)" style={{ marginTop: 2, flexShrink: 0 }} />
            <Text size="sm" c="dimmed">
              Nội dung này yêu cầu mật khẩu truy cập. Vui lòng nhập mật khẩu để tiếp tục.
            </Text>
          </Group>

          <PasswordInput
            label="Mật khẩu truy cập"
            placeholder="Nhập mật khẩu..."
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
            error={isInvalid ? 'Mật khẩu không đúng, vui lòng thử lại.' : undefined}
            autoFocus
          />

          <Group justify="flex-end">
            <Button variant="default" type="button" onClick={onClose}>
              Hủy
            </Button>
            <Button color="orange" type="submit" disabled={!value.trim()}>
              Xác nhận
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}