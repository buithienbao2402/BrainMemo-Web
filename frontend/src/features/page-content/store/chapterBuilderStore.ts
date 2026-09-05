import { create } from 'zustand';
import type { AccessType } from '@/features/course-management/types/course-management.types';

export type BlockType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO';

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
   * Khi hydrate từ BE (luồng Sửa), đây là URL công khai mà BE đã resolve sẵn từ objectKey, dùng để
   * hiển thị media đã có sẵn (không phải object URL cục bộ).
   */
  previewUrl: string | null;
}

export type BlockDraft = TextBlockDraft | MediaBlockDraft;

export interface PageDraft {
  pageTempId: string;
  /**
   * ID thật của trang trên server. Có giá trị => trang đã tồn tại (luồng Sửa) -> PUT /api/pages/{id}.
   * Không có giá trị => trang mới thêm trong phiên này -> POST /api/chapters/{chapterId}/pages.
   */
  pageId?: number;
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

/** Dữ liệu chương lấy về từ BE (GET /api/chapters/{id} + GET /api/pages/{id} cho từng trang),
 *  dùng để hydrate vào store khi vào luồng Sửa. */
export interface ChapterServerSnapshot {
  chapterId: number;
  chapterTitle: string;
  accessType: AccessType;
  pages: PageDraft[];
}

interface ChapterBuilderState extends ChapterDraftSnapshot {
  /** null = đang ở luồng Tạo mới. Có giá trị = đang Sửa chương này (dùng để PUT /api/chapters/{chapterId}). */
  chapterId: number | null;
  activePageTempId: string | null;
  /** pageId thật đã bị Creator xóa khỏi draft trong luồng Sửa -> cần DELETE khi bấm "Lưu thay đổi". */
  removedPageIds: number[];
  /** blockId thật đã bị Creator xóa khỏi draft trong luồng Sửa -> cần DELETE khi bấm "Lưu thay đổi". */
  removedBlockIds: number[];

  /** Nạp dữ liệu chương đã lấy từ BE vào store (chỉ dùng cho luồng Sửa). */
  hydrateFromServer: (snapshot: ChapterServerSnapshot) => void;
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
    chapterId: null as number | null,
    chapterTitle: '',
    accessType: 'PUBLIC' as AccessType,
    passcode: '',
    pages: [firstPage],
    activePageTempId: firstPage.pageTempId,
    removedPageIds: [] as number[],
    removedBlockIds: [] as number[],
  };
}

export const useChapterBuilderStore = create<ChapterBuilderState>((set) => ({
  ...buildInitialState(),

  hydrateFromServer: (snapshot) =>
    set({
      chapterId: snapshot.chapterId,
      chapterTitle: snapshot.chapterTitle,
      accessType: snapshot.accessType,
      // BE không trả lại passcode thật khi GET (lý do bảo mật) -> để trống.
      // UI hiểu ô trống trong luồng Sửa là "giữ nguyên mật mã cũ", chỉ gửi passcode mới khi Creator nhập lại.
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
        // Trang bị xóa đã tồn tại trên server (đang Sửa) -> ghi nhớ để DELETE khi Lưu thay đổi.
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
        // Block bị xóa đã tồn tại trên server (đang Sửa) -> ghi nhớ để DELETE khi Lưu thay đổi.
        removedBlockIds:
          target?.blockId != null ? [...state.removedBlockIds, target.blockId] : state.removedBlockIds,
      };
    }),

  resetStore: () => set(buildInitialState()),
}));