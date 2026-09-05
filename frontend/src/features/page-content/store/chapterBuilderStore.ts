import { create } from 'zustand';
import type { AccessType } from '@/features/course-management/types/course-management.types';

export type BlockType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO';

interface BaseBlockDraft {
  blockTempId: string;
}

export interface TextBlockDraft extends BaseBlockDraft {
  blockType: 'TEXT';
  contentText: string;
}

export interface MediaBlockDraft extends BaseBlockDraft {
  blockType: 'IMAGE' | 'VIDEO' | 'AUDIO';
  rawFile: File | null;
  /** object URL để preview - tự tạo/thu hồi ở UI, KHÔNG gửi lên server */
  previewUrl: string | null;
}

export type BlockDraft = TextBlockDraft | MediaBlockDraft;

export interface PageDraft {
  pageTempId: string;
  title: string;
  blocks: BlockDraft[];
}

/** Snapshot state cần cho lúc submit (bỏ các action) - dùng chung cho mock/real API. */
export interface ChapterDraftSnapshot {
  chapterTitle: string;
  accessType: AccessType;
  passcode: string;
  pages: PageDraft[];
}

interface ChapterBuilderState extends ChapterDraftSnapshot {
  activePageTempId: string | null;

  updateChapterInfo: (
    info: Partial<Pick<ChapterDraftSnapshot, 'chapterTitle' | 'accessType' | 'passcode'>>
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
  return { blockTempId: crypto.randomUUID(), blockType, rawFile: null, previewUrl: null };
}

function buildInitialState() {
  const firstPage = createEmptyPage(1);
  return {
    chapterTitle: '',
    accessType: 'PUBLIC' as AccessType,
    passcode: '',
    pages: [firstPage],
    activePageTempId: firstPage.pageTempId,
  };
}

export const useChapterBuilderStore = create<ChapterBuilderState>((set) => ({
  ...buildInitialState(),

  updateChapterInfo: (info) => set((state) => ({ ...state, ...info })),

  addPage: () =>
    set((state) => {
      const newPage = createEmptyPage(state.pages.length + 1);
      return { pages: [...state.pages, newPage], activePageTempId: newPage.pageTempId };
    }),

  removePage: (pageTempId) =>
    set((state) => {
      const pages = state.pages.filter((p) => p.pageTempId !== pageTempId);
      const activePageTempId =
        state.activePageTempId === pageTempId
          ? (pages[0]?.pageTempId ?? null)
          : state.activePageTempId;
      return { pages, activePageTempId };
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
    set((state) => ({
      pages: state.pages.map((p) =>
        p.pageTempId === pageTempId
          ? { ...p, blocks: p.blocks.filter((b) => b.blockTempId !== blockTempId) }
          : p
      ),
    })),

  resetStore: () => set(buildInitialState()),
}));