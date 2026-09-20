import { useState, useEffect } from 'react';
import {
    Alert,
    Button,
    Group,
    Modal,
    NumberInput,
    SegmentedControl,
    Stack,
    Text,
    Textarea,
} from '@mantine/core';
import { IconAlertCircle, IconSparkles } from '@tabler/icons-react';
import type { AiDifficulty, AiGeneratePayload } from '../api/ai.api';

const MIN_CONTENT_LENGTH = 30;
const MAX_CONTENT_LENGTH = 20_000;
const MAX_COUNT = 10;

interface AiGenerateModalProps {
    opened: boolean;
    onClose: () => void;
    kind: 'FLASHCARD' | 'QUIZ';
    // Hỗ trợ cả 2 tên prop để không bao giờ bị lỗi không tìm thấy hàm
    onSubmit?: (payload: AiGeneratePayload) => Promise<void>;
    onGenerate?: (payload: AiGeneratePayload) => Promise<void>;
}

export function AiGenerateModal({
    opened,
    onClose,
    kind,
    onSubmit,
    onGenerate,
}: AiGenerateModalProps) {
    const [contentText, setContentText] = useState('');
    const [count, setCount] = useState<number>(5);
    const [difficulty, setDifficulty] = useState<AiDifficulty>('medium');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (opened) {
            setError(null);
        }
    }, [opened]);

    const label = kind === 'FLASHCARD' ? 'thẻ ghi nhớ' : 'câu hỏi trắc nghiệm';
    const trimmedLength = contentText.trim().length;
    const canSubmit = trimmedLength >= MIN_CONTENT_LENGTH && !loading;

    const handleClose = () => {
        if (loading) return;
        setError(null);
        onClose();
    };

    const handleSubmit = async () => {
        setError(null);
        setLoading(true);
        try {
            // Ưu tiên gọi hàm được truyền vào (onSubmit hoặc onGenerate)
            const actionFn = onSubmit ?? onGenerate;
            if (!actionFn) {
                throw new Error('Chưa truyền hàm xử lý onGenerate/onSubmit vào Modal.');
            }

            await actionFn({ contentText: contentText.trim(), count, difficulty });
            setContentText(''); // Xóa nội dung khi tạo thành công
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Không thể tạo nội dung bằng AI. Vui lòng thử lại.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
      opened= { opened }
    onClose = { handleClose }
    title = {`Tự động sinh ${label} bằng AI`
}
size = "lg"
centered
closeOnClickOutside = { false}
closeOnEscape = {!loading}
    >
    <Stack gap="md" >
        <Textarea
          label="Nội dung bài học / tài liệu"
placeholder = "Dán đoạn văn bản, bài giảng hoặc tài liệu tóm tắt vào đây..."
autosize
minRows = { 8}
maxRows = { 14}
maxLength = { MAX_CONTENT_LENGTH }
value = { contentText }
onChange = {(e) => {
    setContentText(e.currentTarget.value);
    if (error) setError(null);
}}
disabled = { loading }
description = {`${trimmedLength}/${MAX_CONTENT_LENGTH} ký tự (tối thiểu ${MIN_CONTENT_LENGTH})`}
        />

    < Group grow align = "flex-start" >
        <NumberInput
            label={ `Số lượng ${label}` }
min = { 1}
max = { MAX_COUNT }
allowDecimal = { false}
clampBehavior = "strict"
value = { count }
onChange = {(v) => setCount(typeof v === 'number' ? v : 5)}
disabled = { loading }
    />
    <div>
    <Text size="sm" fw = { 500} mb = { 4} >
        Mức độ
            </Text>
            < SegmentedControl
fullWidth
value = { difficulty }
onChange = {(v) => setDifficulty(v as AiDifficulty)}
disabled = { loading }
data = {
    [
    { value: 'easy', label: 'Dễ' },
    { value: 'medium', label: 'Trung bình' },
    { value: 'hard', label: 'Nâng cao' },
              ]}
    />
    </div>
    </Group>

{
    error && (
        <Alert color="red" variant = "light" icon = {< IconAlertCircle size = { 16} />}>
        { error }
            </Alert>
        )}

<Text size="xs" c = "dimmed" >
    Kết quả do AI tạo chỉ là bản nháp.Bạn có thể xem lại, chỉnh sửa hoặc xóa trước khi lưu chương.
        </Text>

        < Group justify = "flex-end" >
            <Button variant="default" onClick = { handleClose } disabled = { loading } >
                Hủy
                </Button>
                < Button
color = "orange"
leftSection = {< IconSparkles size = { 16} />}
loading = { loading }
disabled = {!canSubmit}
onClick = { handleSubmit }
    >
{ loading? 'AI đang xử lý...': 'Tạo nội dung' }
    </Button>
    </Group>
    </Stack>
    </Modal>
  );
}