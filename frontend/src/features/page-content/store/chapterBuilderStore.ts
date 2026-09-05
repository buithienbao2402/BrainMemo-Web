import { create } from 'zustand';
import type { AccessType } from '@/features/course-management/types/course-management.types';

export type BlockType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FLASHCARD' | 'QUIZ';

interface BaseBlockDraft {
  blockTempId: string;
  /**
   * ID thật của block trên server. Có giá trị => block này đã tồn tại (được hydrate từ luồng Sửa)
   * -> lúc Lưu thay đổi phải PUT /api/blocks/{id}. Không có giá trị => block mới thêm trong phiên
   * làm việc này -> phải POST /api/pages/{pageId}/blocks.
   */
  blockId?: number;
}

export interface TextBlockDraft extends BaseBlockDraft {
  blockType: 'TEXT';
  contentText: string;
}

export interface MediaBlockDraft extends BaseBlockDraft {
  blockType: 'IMAGE' | 'VIDEO' | 'AUDIO';
  rawFile: File | null;
  /**
   * Object URL để preview - tự tạo/thu hồi ở UI khi Creator chọn file mới, KHÔNG gửi lên server.
   * Khi hydrate từ BE (luồng Sửa), đây là URL/objectKey mà BE trả về, dùng để hiển thị media đã có sẵn.
   */
  previewUrl: string | null;
}

export interface FlashcardItemInput {
  itemTempId: string;
  /** ID thật của flashcard nếu được hydrate từ server. Không dùng khi submit (BE full-replace theo blockId). */
  flashcardId?: number;
  frontText: string;
  backText: string;
}

export interface FlashcardBlockDraft extends BaseBlockDraft {
  blockType: 'FLASHCARD';
  items: FlashcardItemInput[];
}

export interface QuizOptionInput {
  optionTempId: string;
  optionId?: number;
  optionText: string;
  isCorrect: boolean;
}

export interface QuizQuestionInput {
  questionTempId: string;
  questionId?: number;
  questionText: string;
  explanation: string;
  options: QuizOptionInput[];
}

export interface QuizBlockDraft extends BaseBlockDraft {
  blockType: 'QUIZ';
  questions: QuizQuestionInput[];
}

export type BlockDraft = TextBlockDraft | MediaBlockDraft | FlashcardBlockDraft | QuizBlockDraft;

export interface PageDraft {
  pageTempId: string;
  pageId?: number;
  title: string;
  blocks: BlockDraft[];
}

export interface ChapterDraftSnapshot {
  chapterTitle: string;
  accessType: AccessType;
  passcode: string;
  isDraft: boolean;
  pages: PageDraft[];
}

export interface ChapterServerSnapshot {
  chapterId: number;
  chapterTitle: string;
  accessType: AccessType;
  isDraft: boolean;
  pages: PageDraft[];
}

interface ChapterBuilderState extends ChapterDraftSnapshot {
  chapterId: number | null;
  activePageTempId: string | null;
  removedPageIds: number[];
  removedBlockIds: number[];

  hydrateFromServer: (snapshot: ChapterServerSnapshot) => void;
  updateChapterInfo: (
    info: Partial<Pick<ChapterDraftSnapshot, 'chapterTitle' | 'accessType' | 'passcode' | 'isDraft'>>
  ) => void;
  addPage: () => void;
  removePage: (pageTempId: string) => void;
  setActivePage: (pageTempId: string) => void;
  updatePageTitle: (pageTempId: string, title: string) => void;
  addBlock: (pageTempId: string, blockType: BlockType) => void;
  updateBlock: (
    pageTempId: string,
    blockTempId: string,
    patch: Partial<Pick<TextBlockDraft, 'contentText'>> | Partial<Pick<MediaBlockDraft, 'rawFile' | 'previewUrl' | 'blockType'>>
  ) => void;
  removeBlock: (pageTempId: string, blockTempId: string) => void;

  addFlashcardItem: (pageTempId: string, blockTempId: string) => void;
  updateFlashcardItem: (
    pageTempId: string,
    blockTempId: string,
    itemTempId: string,
    patch: Partial<Pick<FlashcardItemInput, 'frontText' | 'backText'>>
  ) => void;
  removeFlashcardItem: (pageTempId: string, blockTempId: string, itemTempId: string) => void;

  addQuizQuestion: (pageTempId: string, blockTempId: string) => void;
  updateQuizQuestion: (
    pageTempId: string,
    blockTempId: string,
    questionTempId: string,
    patch: Partial<Pick<QuizQuestionInput, 'questionText' | 'explanation'>>
  ) => void;
  removeQuizQuestion: (pageTempId: string, blockTempId: string, questionTempId: string) => void;
  addQuizOption: (pageTempId: string, blockTempId: string, questionTempId: string) => void;
  updateQuizOptionText: (
    pageTempId: string,
    blockTempId: string,
    questionTempId: string,
    optionTempId: string,
    optionText: string
  ) => void;
  setCorrectQuizOption: (
    pageTempId: string,
    blockTempId: string,
    questionTempId: string,
    optionTempId: string
  ) => void;
  removeQuizOption: (
    pageTempId: string,
    blockTempId: string,
    questionTempId: string,
    optionTempId: string
  ) => void;

  resetStore: () => void;
}

function createEmptyPage(index: number): PageDraft {
  return {
    pageTempId: crypto.randomUUID(),
    title: `Trang ${index}`,
    blocks: [],
  };
}

function createEmptyBlock(blockType: BlockType): BlockDraft {
  if (blockType === 'TEXT') {
    return { blockTempId: crypto.randomUUID(), blockType: 'TEXT', contentText: '' };
  }
  if (blockType === 'FLASHCARD') {
    return {
      blockTempId: crypto.randomUUID(),
      blockType: 'FLASHCARD',
      items: [{ itemTempId: crypto.randomUUID(), frontText: '', backText: '' }],
    };
  }
  if (blockType === 'QUIZ') {
    return {
      blockTempId: crypto.randomUUID(),
      blockType: 'QUIZ',
      questions: [
        {
          questionTempId: crypto.randomUUID(),
          questionText: '',
          explanation: '',
          options: [
            { optionTempId: crypto.randomUUID(), optionText: '', isCorrect: true },
            { optionTempId: crypto.randomUUID(), optionText: '', isCorrect: false },
          ],
        },
      ],
    };
  }
  return { blockTempId: crypto.randomUUID(), blockType, rawFile: null, previewUrl: null };
}

function buildInitialState() {
  const firstPage = createEmptyPage(1);
  return {
    chapterId: null as number | null,
    chapterTitle: '',
    accessType: 'PUBLIC' as AccessType,
    passcode: '',
    isDraft: false,
    pages: [firstPage],
    activePageTempId: firstPage.pageTempId,
    removedPageIds: [] as number[],
    removedBlockIds: [] as number[],
  };
}

/** Helper dùng chung: áp `updater` lên đúng 1 block (theo pageTempId + blockTempId), giữ nguyên các block khác. */
function updateBlockInPages(
  pages: PageDraft[],
  pageTempId: string,
  blockTempId: string,
  updater: (block: BlockDraft) => BlockDraft
): PageDraft[] {
  return pages.map((p) =>
    p.pageTempId === pageTempId
      ? { ...p, blocks: p.blocks.map((b) => (b.blockTempId === blockTempId ? updater(b) : b)) }
      : p
  );
}

export const useChapterBuilderStore = create<ChapterBuilderState>((set) => ({
  ...buildInitialState(),

  hydrateFromServer: (snapshot) =>
    set({
      chapterId: snapshot.chapterId,
      chapterTitle: snapshot.chapterTitle,
      accessType: snapshot.accessType,
      isDraft: snapshot.isDraft,
      passcode: '',
      pages: snapshot.pages,
      activePageTempId: snapshot.pages[0]?.pageTempId ?? null,
      removedPageIds: [],
      removedBlockIds: [],
    }),

  updateChapterInfo: (info) => set((state) => ({ ...state, ...info })),

  addPage: () =>
    set((state) => {
      const newPage = createEmptyPage(state.pages.length + 1);
      return { pages: [...state.pages, newPage], activePageTempId: newPage.pageTempId };
    }),

  removePage: (pageTempId) =>
    set((state) => {
      const target = state.pages.find((p) => p.pageTempId === pageTempId);
      const pages = state.pages.filter((p) => p.pageTempId !== pageTempId);
      const activePageTempId =
        state.activePageTempId === pageTempId
          ? (pages[0]?.pageTempId ?? null)
          : state.activePageTempId;
      return {
        pages,
        activePageTempId,
        removedPageIds:
          target?.pageId != null ? [...state.removedPageIds, target.pageId] : state.removedPageIds,
      };
    }),

  setActivePage: (pageTempId) => set({ activePageTempId: pageTempId }),

  updatePageTitle: (pageTempId, title) =>
    set((state) => ({
      pages: state.pages.map((p) => (p.pageTempId === pageTempId ? { ...p, title } : p)),
    })),

  addBlock: (pageTempId, blockType) =>
    set((state) => ({
      pages: state.pages.map((p) =>
        p.pageTempId === pageTempId
          ? { ...p, blocks: [...p.blocks, createEmptyBlock(blockType)] }
          : p
      ),
    })),

  updateBlock: (pageTempId, blockTempId, patch) =>
    set((state) => ({
      pages: state.pages.map((p) =>
        p.pageTempId === pageTempId
          ? {
            ...p,
            blocks: p.blocks.map((b) =>
              b.blockTempId === blockTempId ? ({ ...b, ...patch } as BlockDraft) : b
            ),
          }
          : p
      ),
    })),

  removeBlock: (pageTempId, blockTempId) =>
    set((state) => {
      const page = state.pages.find((p) => p.pageTempId === pageTempId);
      const target = page?.blocks.find((b) => b.blockTempId === blockTempId);
      return {
        pages: state.pages.map((p) =>
          p.pageTempId === pageTempId
            ? { ...p, blocks: p.blocks.filter((b) => b.blockTempId !== blockTempId) }
            : p
        ),
        removedBlockIds:
          target?.blockId != null ? [...state.removedBlockIds, target.blockId] : state.removedBlockIds,
      };
    }),

  // ---------------- FLASHCARD ----------------

  addFlashcardItem: (pageTempId, blockTempId) =>
    set((state) => ({
      pages: updateBlockInPages(state.pages, pageTempId, blockTempId, (b) => {
        if (b.blockType !== 'FLASHCARD') return b;
        return {
          ...b,
          items: [...b.items, { itemTempId: crypto.randomUUID(), frontText: '', backText: '' }],
        };
      }),
    })),

  updateFlashcardItem: (pageTempId, blockTempId, itemTempId, patch) =>
    set((state) => ({
      pages: updateBlockInPages(state.pages, pageTempId, blockTempId, (b) => {
        if (b.blockType !== 'FLASHCARD') return b;
        return {
          ...b,
          items: b.items.map((it) => (it.itemTempId === itemTempId ? { ...it, ...patch } : it)),
        };
      }),
    })),

  removeFlashcardItem: (pageTempId, blockTempId, itemTempId) =>
    set((state) => ({
      pages: updateBlockInPages(state.pages, pageTempId, blockTempId, (b) => {
        if (b.blockType !== 'FLASHCARD') return b;
        // Luôn giữ tối thiểu 1 cặp - khớp ràng buộc BE "Flashcard cần ít nhất 1 cặp mặt trước/sau".
        if (b.items.length <= 1) return b;
        return { ...b, items: b.items.filter((it) => it.itemTempId !== itemTempId) };
      }),
    })),

  // ---------------- QUIZ ----------------

  addQuizQuestion: (pageTempId, blockTempId) =>
    set((state) => ({
      pages: updateBlockInPages(state.pages, pageTempId, blockTempId, (b) => {
        if (b.blockType !== 'QUIZ') return b;
        return {
          ...b,
          questions: [
            ...b.questions,
            {
              questionTempId: crypto.randomUUID(),
              questionText: '',
              explanation: '',
              options: [
                { optionTempId: crypto.randomUUID(), optionText: '', isCorrect: true },
                { optionTempId: crypto.randomUUID(), optionText: '', isCorrect: false },
              ],
            },
          ],
        };
      }),
    })),

  updateQuizQuestion: (pageTempId, blockTempId, questionTempId, patch) =>
    set((state) => ({
      pages: updateBlockInPages(state.pages, pageTempId, blockTempId, (b) => {
        if (b.blockType !== 'QUIZ') return b;
        return {
          ...b,
          questions: b.questions.map((q) =>
            q.questionTempId === questionTempId ? { ...q, ...patch } : q
          ),
        };
      }),
    })),

  removeQuizQuestion: (pageTempId, blockTempId, questionTempId) =>
    set((state) => ({
      pages: updateBlockInPages(state.pages, pageTempId, blockTempId, (b) => {
        if (b.blockType !== 'QUIZ') return b;
        // Luôn giữ tối thiểu 1 câu hỏi - khớp ràng buộc BE "Quiz cần ít nhất 1 câu hỏi".
        if (b.questions.length <= 1) return b;
        return { ...b, questions: b.questions.filter((q) => q.questionTempId !== questionTempId) };
      }),
    })),

  addQuizOption: (pageTempId, blockTempId, questionTempId) =>
    set((state) => ({
      pages: updateBlockInPages(state.pages, pageTempId, blockTempId, (b) => {
        if (b.blockType !== 'QUIZ') return b;
        return {
          ...b,
          questions: b.questions.map((q) =>
            q.questionTempId === questionTempId
              ? {
                ...q,
                options: [...q.options, { optionTempId: crypto.randomUUID(), optionText: '', isCorrect: false }],
              }
              : q
          ),
        };
      }),
    })),

  updateQuizOptionText: (pageTempId, blockTempId, questionTempId, optionTempId, optionText) =>
    set((state) => ({
      pages: updateBlockInPages(state.pages, pageTempId, blockTempId, (b) => {
        if (b.blockType !== 'QUIZ') return b;
        return {
          ...b,
          questions: b.questions.map((q) =>
            q.questionTempId === questionTempId
              ? {
                ...q,
                options: q.options.map((o) =>
                  o.optionTempId === optionTempId ? { ...o, optionText } : o
                ),
              }
              : q
          ),
        };
      }),
    })),

  setCorrectQuizOption: (pageTempId, blockTempId, questionTempId, optionTempId) =>
    set((state) => ({
      pages: updateBlockInPages(state.pages, pageTempId, blockTempId, (b) => {
        if (b.blockType !== 'QUIZ') return b;
        return {
          ...b,
          questions: b.questions.map((q) =>
            q.questionTempId === questionTempId
              ? {
                ...q,
                // Giống radio: chỉ 1 đáp án đúng - khớp ràng buộc BE "đúng 1 đáp án đúng".
                options: q.options.map((o) => ({ ...o, isCorrect: o.optionTempId === optionTempId })),
              }
              : q
          ),
        };
      }),
    })),

  removeQuizOption: (pageTempId, blockTempId, questionTempId, optionTempId) =>
    set((state) => ({
      pages: updateBlockInPages(state.pages, pageTempId, blockTempId, (b) => {
        if (b.blockType !== 'QUIZ') return b;
        return {
          ...b,
          questions: b.questions.map((q) => {
            if (q.questionTempId !== questionTempId) return q;
            // Luôn giữ tối thiểu 2 đáp án - khớp ràng buộc BE "tối thiểu 2 đáp án".
            if (q.options.length <= 2) return q;
            const wasCorrect = q.options.find((o) => o.optionTempId === optionTempId)?.isCorrect;
            const remaining = q.options.filter((o) => o.optionTempId !== optionTempId);
            // Nếu vừa xóa đáp án đang là "đúng", tự gán lại đáp án đầu tiên còn lại làm đáp án đúng
            // để tránh rơi vào trạng thái "0 đáp án đúng" (BE sẽ từ chối request này).
            const options = wasCorrect
              ? remaining.map((o, i) => ({ ...o, isCorrect: i === 0 }))
              : remaining;
            return { ...q, options };
          }),
        };
      }),
    })),

  resetStore: () => set(buildInitialState()),
}));