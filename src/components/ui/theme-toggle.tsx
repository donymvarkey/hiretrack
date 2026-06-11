import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/store/theme-store'

export function ThemeToggle({ className }: { className?: string }) {
  const { resolved, toggleTheme } = useThemeStore()
  const isDark = resolved === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer',
        className
      )}
    >
      <Sun
        className={cn(
          'h-[1.15rem] w-[1.15rem] transition-all duration-300',
          isDark ? 'rotate-90 scale-0' : 'rotate-0 scale-100'
        )}
      />
      <Moon
        className={cn(
          'absolute h-[1.15rem] w-[1.15rem] transition-all duration-300',
          isDark ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
        )}
      />
    </button>
  )
}
