import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Briefcase, Calendar, Bell, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Home', end: true },
  { to: '/applications', icon: Briefcase, label: 'Applications', end: false },
  { to: '/calendar', icon: Calendar, label: 'Calendar', end: false },
  { to: '/follow-ups', icon: Bell, label: 'Follow-ups', end: false },
  { to: '/settings', icon: Settings, label: 'Settings', end: false },
]

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Primary"
    >
      <div className="mx-auto flex h-16 max-w-md items-stretch justify-around px-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'group flex flex-1 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex h-7 w-12 items-center justify-center rounded-full transition-colors',
                    isActive && 'bg-accent'
                  )}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                </span>
                <span className="leading-none">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
