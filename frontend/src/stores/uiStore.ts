import { create } from 'zustand';

interface UIState {
  isCreateCourseModalOpen: boolean;
  openCreateCourseModal: () => void;
  closeCreateCourseModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCreateCourseModalOpen: false,
  openCreateCourseModal: () => set({ isCreateCourseModalOpen: true }),
  closeCreateCourseModal: () => set({ isCreateCourseModalOpen: false }),
}));