import { create } from 'zustand';
import type { NavigationState } from '@/types/navigation';

/**
 * Zustand store for navigation state management
 * Controls mobile drawer open/close state
 */
export const useNavigation = create<NavigationState>((set) => ({
  isDrawerOpen: false,

  openDrawer: () => set({ isDrawerOpen: true }),

  closeDrawer: () => set({ isDrawerOpen: false }),

  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
}));
