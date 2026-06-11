import { create } from 'zustand'

interface AppState {
  quickAddOpen: boolean
  setQuickAddOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  quickAddOpen: false,
  setQuickAddOpen: (quickAddOpen) => set({ quickAddOpen }),
}))
