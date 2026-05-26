import { Menu, Plus, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/app-store'
import { useAuthStore } from '@/store/auth-store'

export function Header() {
  const { toggleSidebar, setQuickAddOpen } = useAppStore()
  const { signOut, user } = useAuthStore()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur px-4">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden cursor-pointer"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-medium text-muted-foreground hidden sm:block">
          Job Application Tracker
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => setQuickAddOpen(true)}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Quick Add</span>
        </Button>

        <div className="flex items-center gap-2 ml-2">
          <span className="text-xs text-muted-foreground hidden md:block">
            {user?.email}
          </span>
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
