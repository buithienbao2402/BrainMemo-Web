import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import { resolveMediaUrl } from '@/shared/utils/mediaUrl';
import type { AccessType } from '@/features/course-management/types/course-management.types';
import type {
    BlockDraft,
    ChapterDraftSnapshot,
    PageDraft,
    ChapterServerSnapshot,
    MediaBlockDraft,
    FlashcardBlockDraft,
    QuizBlockDraft,
} from '../store/chapterBuilderStore';

interface CreateChapterResponseData {
    chapterId: number;
}

interface CreatePageResponseData {
    pageId: number;
}

interface ChapterSummaryResponse {
    id: number;
    title: string;
    accessType: AccessType;
    isDraft: boolean;
    pages: Array<{ id: number; title: string; orderIndex: number; accessType: AccessType }>;
}

interface QuizOptionResponse {
    optionId: number;
    optionText: string;
    isCorrect: boolean;
}

interface QuizQuestionResponse {
    questionId: number;
    questionText: string;
    explanation: string | null;
    orderIndex: number;
    options: QuizOptionResponse[];
}

interface FlashcardItemResponse {
    flashcardId: number;
    frontText: string;
    backText: string;
    orderIndex: number;
}

interface PageDetailResponse {
    id: number;
    title: string;
    blocks: Array<
        | { id: number; blockType: 'TEXT'; contentText: string }
        | { id: number; blockType: 'IMAGE' | 'AUDIO' | 'VIDEO'; mediaUrl: string | null; contentText?: string | null }
        | { id: number; blockType: 'QUIZ'; quiz: { quizId: number; questions: QuizQuestionResponse[] } }
        | { id: number; blockType: 'FLASHCARD'; flashcards: FlashcardItemResponse[] }
    >;
}

async function createChapter(courseId: number, draftState: ChapterDraftSnapshot): Promise<number> {
    const { data } = await apiClient.post<ApiResponse<CreateChapterResponseData>>(
        `/courses/${courseId}/chapters`,
        {
            title: draftState.chapterTitle,
            accessType: draftState.accessType,
            isDraft: draftState.isDraft,
            ...(draftState.accessType === 'PROTECTED' ? { passcode: draftState.passcode } : {}),
        }
    );
    return data.data.chapterId;
}

// BE gán OrderIndex = dto.OrderIndex (mặc định 1) -> bắt buộc phải gửi orderIndex để giữ đúng thứ tự
async function createPage(chapterId: number, page: PageDraft, orderIndex: number): Promise<number> {
    const { data } = await apiClient.post<ApiResponse<CreatePageResponseData>>(
        `/chapters/${chapterId}/pages`,
        { title: page.title, orderIndex }
    );
    return data.data.pageId;
}

// ---------------------------------------------------------------------------
// Payload cho FLASHCARD / QUIZ - dùng chung cho cả Create và Update (full-replace)
// ---------------------------------------------------------------------------

function buildFlashcardPayload(block: FlashcardBlockDraft) {
    return {
        blockType: 'FLASHCARD' as const,
        // QUAN TRỌNG: DTO backend (BlockRequestDto.Flashcards) yêu cầu key "flashcards", KHÔNG PHẢI
        // "cards" như api_contract.md cũ ghi. ASP.NET Core bind JSON không phân biệt hoa/thường nhưng
        // không tự đổi tên trường - gửi "cards" sẽ luôn ra dto.Flashcards = null ở backend.
        flashcards: block.items.map((item, index) => ({
            frontText: item.frontText,
            backText: item.backText,
            orderIndex: index,
        })),
    };
}

function buildQuizPayload(block: QuizBlockDraft) {
    return {
        blockType: 'QUIZ' as const,
        questions: block.questions.map((q, index) => ({
            questionText: q.questionText,
            explanation: q.explanation.trim() ? q.explanation : null,
            orderIndex: index,
            options: q.options.map((o) => ({
                optionText: o.optionText,
                isCorrect: o.isCorrect,
            })),
        })),
    };
}

/**
 * Payload dùng chung cho POST (tạo block) và PUT (sửa block).
 * Media đã được upload ngay lúc chọn file (POST /media/upload), nên ở đây chỉ gửi `mediaUrl` = objectKey.
 */
function buildBlockPayload(block: BlockDraft, orderIndex: number) {
    switch (block.blockType) {
        case 'TEXT':
            return { blockType: 'TEXT' as const, orderIndex, contentText: block.contentText };
        case 'FLASHCARD':
            return { ...buildFlashcardPayload(block), orderIndex };
        case 'QUIZ':
            return { ...buildQuizPayload(block), orderIndex };
        default: {
            if (!block.mediaKey) {
                throw new Error(`Block ${block.blockType} chưa tải tệp lên, không thể lưu.`);
            }
            return { blockType: block.blockType, orderIndex, mediaUrl: block.mediaKey };
        }
    }
}

async function createBlock(pageId: number, block: BlockDraft, orderIndex: number): Promise<void> {
    await apiClient.post(`/pages/${pageId}/blocks`, buildBlockPayload(block, orderIndex));
}

// ---------------------------------------------------------------------------
// Đọc chi tiết chương (luồng Sửa)
// ---------------------------------------------------------------------------
export async function fetchChapterDetailReal(chapterId: number): Promise<ChapterServerSnapshot> {
    const { data: chapterEnvelope } = await apiClient.get<ApiResponse<ChapterSummaryResponse>>(
        `/chapters/${chapterId}`
    );
    const chapter = chapterEnvelope.data;

    const pages: PageDraft[] = await Promise.all(
        chapter.pages.map(async (pageSummary) => {
            const { data: pageEnvelope } = await apiClient.get<ApiResponse<PageDetailResponse>>(
                `/pages/${pageSummary.id}`
            );
            const pageDetail = pageEnvelope.data;

            const blocks: BlockDraft[] = pageDetail.blocks.map((b) => {
                if (b.blockType === 'TEXT') {
                    return {
                        blockTempId: crypto.randomUUID(),
                        blockId: b.id,
                        blockType: 'TEXT',
                        contentText: b.contentText,
                    };
                }

                if (b.blockType === 'FLASHCARD') {
                    const flashcardBlock: FlashcardBlockDraft = {
                        blockTempId: crypto.randomUUID(),
                        blockId: b.id,
                        blockType: 'FLASHCARD',
                        items: b.flashcards.map((f) => ({
                            itemTempId: crypto.randomUUID(),
                            flashcardId: f.flashcardId,
                            frontText: f.frontText,
                            backText: f.backText,
                        })),
                    };
                    return flashcardBlock;
                }

                if (b.blockType === 'QUIZ') {
                    const quizBlock: QuizBlockDraft = {
                        blockTempId: crypto.randomUUID(),
                        blockId: b.id,
                        blockType: 'QUIZ',
                        questions: b.quiz.questions.map((q) => ({
                            questionTempId: crypto.randomUUID(),
                            questionId: q.questionId,
                            questionText: q.questionText,
                            explanation: q.explanation ?? '',
                            options: q.options.map((o) => ({
                                optionTempId: crypto.randomUUID(),
                                optionId: o.optionId,
                                optionText: o.optionText,
                                isCorrect: o.isCorrect,
                            })),
                        })),
                    };
                    return quizBlock;
                }

                const mediaBlock: MediaBlockDraft = {
                    blockTempId: crypto.randomUUID(),
                    blockId: b.id,
                    blockType: b.blockType,
                    rawFile: null,
                    previewUrl: resolveMediaUrl(b.mediaUrl),
                    mediaKey: b.mediaUrl ?? null,
                };
                return mediaBlock;
            });

            return {
                pageTempId: crypto.randomUUID(),
                pageId: pageDetail.id,
                title: pageDetail.title,
                blocks,
            };
        })
    );

    return {
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        accessType: chapter.accessType,
        isDraft: chapter.isDraft,
        pages,
    };
}

// ---------------------------------------------------------------------------
// Submit: Tạo mới chương
// ---------------------------------------------------------------------------
export async function submitChapterDraftReal(
    courseId: number,
    draftState: ChapterDraftSnapshot
): Promise<{ success: true; chapterId: number }> {
    let chapterId: number | null = null;

    try {
        chapterId = await createChapter(courseId, draftState);

        for (const [pageIndex, page] of draftState.pages.entries()) {
            const pageId = await createPage(chapterId, page, pageIndex);
            for (const [blockIndex, block] of page.blocks.entries()) {
                await createBlock(pageId, block, blockIndex);
            }
        }

        return { success: true, chapterId };
    } catch (error) {
        if (chapterId !== null) {
            try {
                await apiClient.delete(`/chapters/${chapterId}`);
            } catch {
                console.error(
                    `[chapter-builder] Dọn rác thất bại: chapter #${chapterId} có thể còn sót lại trên server.`
                );
            }
        }
        throw error;
    }
}

// ---------------------------------------------------------------------------
// Submit: Cập nhật chương (luồng Sửa)
// ---------------------------------------------------------------------------
export async function updateChapterDraftReal(
    chapterId: number,
    draftState: ChapterDraftSnapshot,
    removedPageIds: number[],
    removedBlockIds: number[]
): Promise<void> {
    await apiClient.put(`/chapters/${chapterId}`, {
        title: draftState.chapterTitle,
        accessType: draftState.accessType,
        isDraft: draftState.isDraft,
        ...(draftState.passcode.trim() ? { passcode: draftState.passcode } : {}),
    });

    await Promise.all(removedPageIds.map((id) => apiClient.delete(`/pages/${id}`)));
    await Promise.all(removedBlockIds.map((id) => apiClient.delete(`/blocks/${id}`)));

    for (const [pageIndex, page] of draftState.pages.entries()) {
        const pageId = page.pageId ?? (await createPage(chapterId, page, pageIndex));
        if (page.pageId) {
            // BE gán OrderIndex = dto.OrderIndex (mặc định 1) nên bắt buộc phải gửi kèm
            await apiClient.put(`/pages/${pageId}`, { title: page.title, orderIndex: pageIndex });
        }

        for (const [blockIndex, block] of page.blocks.entries()) {
            const payload = buildBlockPayload(block, blockIndex);
            if (block.blockId) {
                await apiClient.put(`/blocks/${block.blockId}`, payload);
            } else {
                await apiClient.post(`/pages/${pageId}/blocks`, payload);
            }
        }
    }
}