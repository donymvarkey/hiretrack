import { Menu, Plus, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAppStore } from '@/store/app-store'

export function Header() {
  const { toggleSidebar, setQuickAddOpen } = useAppStore()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden cursor-pointer text-muted-foreground hover:text-foreground"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile brand (sidebar hidden) */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold">HireTrack</span>
        </div>

        <p className="hidden text-sm text-muted-foreground lg:block">
          Track every application, interview, and follow-up.
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <Button size="sm" onClick={() => setQuickAddOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Quick Add</span>
        </Button>
      </div>
    </header>
  )
}
