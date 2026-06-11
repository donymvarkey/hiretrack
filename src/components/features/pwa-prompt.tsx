import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Download, RefreshCw, X, Wifi } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PwaPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installDismissed, setInstallDismissed] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstallEvent(null))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Auto-dismiss the "offline ready" toast after a few seconds
  useEffect(() => {
    if (!offlineReady) return
    const t = setTimeout(() => setOfflineReady(false), 5000)
    return () => clearTimeout(t)
  }, [offlineReady, setOfflineReady])

  const handleInstall = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    await installEvent.userChoice
    setInstallEvent(null)
  }

  const showInstall = installEvent && !installDismissed && !needRefresh

  if (!needRefresh && !offlineReady && !showInstall) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0">
      {needRefresh ? (
        <Toast
          icon={<RefreshCw className="h-4 w-4 text-primary" />}
          title="Update available"
          description="A new version of HireTrack is ready."
          onClose={() => setNeedRefresh(false)}
          action={
            <Button size="sm" onClick={() => updateServiceWorker(true)}>
              Reload
            </Button>
          }
        />
      ) : showInstall ? (
        <Toast
          icon={<Download className="h-4 w-4 text-primary" />}
          title="Install HireTrack"
          description="Add it to your home screen for quick access."
          onClose={() => setInstallDismissed(true)}
          action={
            <Button size="sm" onClick={handleInstall} className="gap-1.5">
              <Download className="h-4 w-4" />
              Install
            </Button>
          }
        />
      ) : (
        <Toast
          icon={<Wifi className="h-4 w-4 text-success" />}
          title="Ready to work offline"
          description="HireTrack is now available without a connection."
          onClose={() => setOfflineReady(false)}
        />
      )}
    </div>
  )
}

interface ToastProps {
  icon: React.ReactNode
  title: string
  description: string
  onClose: () => void
  action?: React.ReactNode
}

function Toast({ icon, title, description, onClose, action }: ToastProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-2xl animate-slide-up">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        {action && <div className="mt-3">{action}</div>}
      </div>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
