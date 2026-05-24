import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Surface =
  | 'channel-os'
  | 'image-studio'
  | 'video-studio'
  | 'tools-studio';

export type Workspace = 'home' | 'scout' | 'content' | 'channels' | 'memory';

interface AppState {
  surface: Surface;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  activeSessionId: string | null;
  activeWorkspace: Workspace;
  setSurface: (s: Surface) => void;
  toggleSidebar: () => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  setActiveSession: (id: string | null) => void;
  setActiveWorkspace: (w: Workspace) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      surface: 'channel-os',
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      activeSessionId: null,
      activeWorkspace: 'home',
      setSurface: (surface) => set({ surface, mobileSidebarOpen: false }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      openMobileSidebar: () => set({ mobileSidebarOpen: true }),
      closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
      setActiveSession: (activeSessionId) => set({ activeSessionId }),
      setActiveWorkspace: (activeWorkspace) => set({ activeWorkspace, mobileSidebarOpen: false }),
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
