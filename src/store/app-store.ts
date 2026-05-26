import { create } from 'zustand'

interface AppState {
  sidebarOpen: boolean
  quickAddOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setQuickAddOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  quickAddOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setQuickAddOpen: (quickAddOpen) => set({ quickAddOpen }),
}))
