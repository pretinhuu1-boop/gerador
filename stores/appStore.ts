import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Surface =
  | 'channel-os'
  | 'image-studio'
  | 'video-studio'
  | 'tools-studio';

interface AppState {
  surface: Surface;
  sidebarCollapsed: boolean;
  activeSessionId: string | null;
  activeWorkspace: 'home' | 'scout' | 'channels' | 'memory';
  setSurface: (s: Surface) => void;
  toggleSidebar: () => void;
  setActiveSession: (id: string | null) => void;
  setActiveWorkspace: (w: AppState['activeWorkspace']) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      surface: 'channel-os',
      sidebarCollapsed: false,
      activeSessionId: null,
      activeWorkspace: 'home',
      setSurface: (surface) => set({ surface }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setActiveSession: (activeSessionId) => set({ activeSessionId }),
      setActiveWorkspace: (activeWorkspace) => set({ activeWorkspace }),
    }),
    {
      name: 'channel-os-app',
      partialize: (s) => ({
        surface: s.surface,
        sidebarCollapsed: s.sidebarCollapsed,
        activeWorkspace: s.activeWorkspace,
      }),
    },
  ),
);
