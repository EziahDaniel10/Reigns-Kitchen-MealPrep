import { create } from 'zustand';

interface UIState {
  contactOpen: boolean;
  contactDefaultTab: 'quick' | 'form';
  openContact: (tab?: 'quick' | 'form') => void;
  closeContact: () => void;
}

export const useUI = create<UIState>((set) => ({
  contactOpen: false,
  contactDefaultTab: 'quick',
  openContact: (tab = 'quick') => set({ contactOpen: true, contactDefaultTab: tab }),
  closeContact: () => set({ contactOpen: false }),
}));
