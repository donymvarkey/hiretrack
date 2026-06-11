import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'hiretrack-theme'

function getStoredTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'dark'
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
  return stored ?? 'dark'
}

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') return systemPrefersDark() ? 'dark' : 'light'
  return theme
}

function applyTheme(theme: Theme) {
  const resolved = resolveTheme(theme)
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved
  // Keep the browser UI (PWA status bar / address bar) in sync
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', resolved === 'dark' ? '#0d0d12' : '#ffffff')
  }
}

interface ThemeState {
  theme: Theme
  resolved: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  initialize: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getStoredTheme(),
  resolved: resolveTheme(getStoredTheme()),
  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme)
    applyTheme(theme)
    set({ theme, resolved: resolveTheme(theme) })
  },
  toggleTheme: () => {
    const next = get().resolved === 'dark' ? 'light' : 'dark'
    get().setTheme(next)
  },
  initialize: () => {
    const theme = getStoredTheme()
    applyTheme(theme)
    set({ theme, resolved: resolveTheme(theme) })

    // React to system changes when in "system" mode
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    mql.addEventListener('change', () => {
      if (get().theme === 'system') {
        applyTheme('system')
        set({ resolved: resolveTheme('system') })
      }
    })
  },
}))
