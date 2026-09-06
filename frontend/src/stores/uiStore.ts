import { create } from 'zustand';

interface UIState {
  isCreateCourseModalOpen: boolean;
  openCreateCourseModal: () => void;
  closeCreateCourseModal: () => void;
  themeMode: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCreateCourseModalOpen: false,
  openCreateCourseModal: () => set({ isCreateCourseModalOpen: true }),
  closeCreateCourseModal: () => set({ isCreateCourseModalOpen: false }),

  themeMode: 'light',
  toggleTheme: () =>
    set((state) => ({
      themeMode: state.themeMode === 'light' ? 'dark' : 'light'
    })),
}));