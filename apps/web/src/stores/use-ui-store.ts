import { create } from 'zustand';

interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'error';
}

interface UiState {
  toasts: Toast[];
  pushToast: (message: string, tone?: Toast['tone']) => void;
  dismissToast: (id: number) => void;
}

/**
 * Client-only UI state (toasts, transient banners). Server data lives in
 * tRPC/React Query caches, not here — see spec §8.2 for the Zustand +
 * tRPC split.
 */
export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  pushToast: (message, tone = 'success') =>
    set((state) => ({ toasts: [...state.toasts, { id: Date.now(), message, tone }] })),
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
