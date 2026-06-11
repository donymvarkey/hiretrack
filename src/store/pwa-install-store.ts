import { create } from 'zustand'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'hiretrack-install-dismissed'

// Kept outside the store: the event isn't serializable and we only need it transiently.
let deferredPrompt: BeforeInstallPromptEvent | null = null

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

interface PwaInstallState {
  /** True when the browser has offered an installable prompt and it hasn't been used/dismissed. */
  canInstall: boolean
  /** True once the app is installed or running standalone. */
  installed: boolean
  /** True once the user has acted on the install message (so we stop nudging). */
  dismissed: boolean
  initialize: () => void
  promptInstall: () => Promise<void>
  dismiss: () => void
}

export const usePwaInstallStore = create<PwaInstallState>((set) => ({
  canInstall: false,
  installed: isStandalone(),
  dismissed:
    typeof localStorage !== 'undefined' && localStorage.getItem(DISMISS_KEY) === '1',

  initialize: () => {
    if (typeof window === 'undefined') return

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e as BeforeInstallPromptEvent
      set({ canInstall: true })
    })

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null
      set({ canInstall: false, installed: true })
    })
  },

  promptInstall: async () => {
    const evt = deferredPrompt
    // Mark as handled regardless of outcome so the message doesn't keep nagging.
    localStorage.setItem(DISMISS_KEY, '1')
    set({ canInstall: false, dismissed: true })
    if (!evt) return
    deferredPrompt = null
    await evt.prompt()
    const choice = await evt.userChoice
    if (choice.outcome === 'accepted') set({ installed: true })
  },

  dismiss: () => {
    localStorage.setItem(DISMISS_KEY, '1')
    set({ dismissed: true })
  },
}))
