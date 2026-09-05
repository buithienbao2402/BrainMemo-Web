// File: src/features/learning/mock/mockReadingData.ts
// FIX: Retype lại toàn bộ chuỗi tiếng Việt chứa "Biến" bằng ký tự Unicode tổ hợp sẵn (precomposed, NFC),
// tránh lỗi combining diacritical mark (ế bị tách thành ê + dấu riêng) khi copy-paste từ nguồn khác.

import type { AccessType } from '@/features/courses/types/course.types';

// ---------- Types cho GET /api/chapters/{id} ----------

export interface PageTabSummary {
  id: number;
  title: string;
  orderIndex: number;
}

export interface ChapterDetail {
  id: number;
  title: string;
  accessType: AccessType;
  orderIndex: number;
  pages: PageTabSummary[];
}

// ---------- Types cho GET /api/pages/{id} ----------

export interface TextBlock {
  id: number;
  blockType: 'TEXT';
  contentText: string;
}

export interface MediaBlock {
  id: number;
  blockType: 'IMAGE' | 'AUDIO' | 'VIDEO';
  mediaUrl: string;
}

export interface QuizOption {
  id: number;
  optionText: string;
  isCorrect?: boolean;
}

export interface QuizQuestion {
  id: number;
  questionText: string;
  explanation: string | null;
  options: QuizOption[];
}

export interface QuizBlock {
  id: number;
  blockType: 'QUIZ';
  questions: QuizQuestion[];
}

export interface FlashcardItem {
  id: number;
  frontText: string;
  backText: string;
}

export interface FlashcardBlock {
  id: number;
  blockType: 'FLASHCARD';
  cards: FlashcardItem[];
}

export type Block = TextBlock | MediaBlock | QuizBlock | FlashcardBlock;

export interface PageDetail {
  id: number;
  title: string;
  blocks: Block[];
}

// ---------- Mock data ----------

export const mockChapterDetail: ChapterDetail = {
  id: 1,
  title: 'Chương 1: Biến & Kiểu Dữ Liệu', // retyped sạch — "Biến" = B-i-ế(U+1EBF)-n
  accessType: 'PUBLIC',
  orderIndex: 1,
  pages: Array.from({ length: 42 }, (_, i) => ({
    id: i + 1,
    title: i === 13 ? 'Biến & Kiểu Dữ Liệu Trong Python' : `Trang ${i + 1}`,
    orderIndex: i + 1,
  })),
};

export const mockPageDetail: PageDetail = {
  id: 14,
  title: 'Biến & Kiểu Dữ Liệu Trong Python', // retyped sạch
  blocks: [
    {
      id: 101,
      blockType: 'TEXT',
      contentText:
        '## Biến là gì?\n\n' + // retyped sạch — trước đó lỗi combining mark ở đúng chữ này
        'Hãy tưởng tượng biến như một chiếc hộp dùng để chứa dữ liệu. Bạn đặt tên cho chiếc hộp đó ' +
        'để sau này có thể dễ dàng tìm lại và sử dụng dữ liệu bên trong.\n\n' +
        '```python\n' +
        '# Khai báo biến\n' +
        'ten_bien = "Xin chào"\n' +
        'tuoi = 25\n' +
        'pi = 3.14\n\n' +
        '# In giá trị ra màn hình\n' +
        'print(ten_bien)\n' +
        'print(tuoi)\n' +
        '```',
    } as TextBlock,
    {
      id: 102,
      blockType: 'IMAGE',
      mediaUrl: 'https://placehold.co/900x420/1a1b1e/e8590c?text=Memory+Allocation+Schematic',
    } as MediaBlock,
    {
      id: 103,
      blockType: 'QUIZ',
      questions: [
        {
          id: 1001,
          questionText: 'Kiểu dữ liệu nào dùng để lưu trữ số nguyên?',
          explanation:
            "Chính xác! 'Integer' (viết tắt là int) là kiểu dữ liệu dành cho các số nguyên như 1, 42, hoặc -10.",
          options: [
            { id: 1, optionText: 'String', isCorrect: false },
            { id: 2, optionText: 'Integer', isCorrect: true },
            { id: 3, optionText: 'Float', isCorrect: false },
            { id: 4, optionText: 'Boolean', isCorrect: false },
          ],
        },
      ],
    } as QuizBlock,
    {
      id: 104,
      blockType: 'FLASHCARD',
      cards: [
        {
          id: 1,
          frontText: 'Biến (Variable) là gì?', // retyped sạch
          backText: 'Một vùng nhớ được đặt tên, dùng để lưu trữ một giá trị có thể thay đổi.',
        },
      ],
    } as FlashcardBlock,
  ],
};

const mockPage13: PageDetail = {
  id: 13,
  title: 'Giới thiệu về Python',
  blocks: [
    {
      id: 91,
      blockType: 'TEXT',
      contentText:
        '## Python là gì?\n\n' +
        'Python là ngôn ngữ lập trình bậc cao, cú pháp gần gũi với ngôn ngữ tự nhiên, ' +
        'phù hợp cho người mới bắt đầu.',
    } as TextBlock,
  ],
};

const mockPage15: PageDetail = {
  id: 15,
  title: 'Toán tử trong Python',
  blocks: [
    {
      id: 105,
      blockType: 'TEXT',
      contentText:
        '## Toán tử số học\n\n' +
        'Python hỗ trợ đầy đủ các toán tử `+ - * / // % **` để tính toán trên số.\n\n' +
        '```python\n' +
        'a = 10\n' +
        'b = 3\n' +
        'print(a // b) # 3 - chia lấy phần nguyên\n' +
        'print(a % b)  # 1 - chia lấy phần dư\n' +
        '```',
    } as TextBlock,
    {
      id: 106,
      blockType: 'IMAGE',
      mediaUrl: 'https://placehold.co/900x300/1a1b1e/e8590c?text=Operators+Table',
    } as MediaBlock,
  ],
};

export const mockPagesById: Record<number, PageDetail> = {
  13: mockPage13,
  14: mockPageDetail,
  15: mockPage15,
};