export interface QuizOption {
  optionId: number;
  optionText: string;
  isCorrect: boolean;
}
export interface QuizQuestion {
  questionId: number;
  questionText: string;
  explanation?: string | null;
  orderIndex: number;
  options: QuizOption[];
}
export interface FlashcardItem {
  flashcardId: number;
  frontText: string;
  backText: string;
  orderIndex: number;
}
export interface Block {
  id: number;
  blockType: 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'QUIZ' | 'FLASHCARD';
  orderIndex?: number;
  contentText?: string | null;
  mediaUrl?: string | null;
  quiz?: { quizId: number; questions: QuizQuestion[] } | null;
  flashcards?: FlashcardItem[] | null;
}
export interface PageDetail {
  id: number;
  chapterId: number;
  title: string;
  orderIndex: number;
  blocks: Block[];
}
export interface PageSummary {
  id: number;
  title: string;
  orderIndex: number;
}
export interface ChapterDetail {
  id: number;
  courseId: number;
  title: string;
  orderIndex: number;
  accessType: 'PUBLIC' | 'PRIVATE' | 'PROTECTED';
  isDraft: boolean;
  createdAt: string;
  pages: PageSummary[];
}