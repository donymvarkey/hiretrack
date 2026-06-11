import { Briefcase, CheckCircle2 } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const highlights = [
  'Track every application in one place',
  'Never miss an interview or follow-up',
  'Visualize your job search progress',
]

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: React.ReactNode
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-brand-gradient p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-black/10 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">HireTrack</span>
        </div>

        <div className="relative space-y-6">
          <h2 className="max-w-md text-3xl font-bold leading-tight">
            Land your next role with a job search that stays organized.
          </h2>
          <ul className="space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-white/90">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/70">
          Your personal job application command center.
        </p>
      </div>

      {/* Form panel */}
      <div className="relative flex w-full flex-col items-center justify-center p-6 lg:w-1/2">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">HireTrack</span>
          </div>

          <div className="mb-6 text-center lg:text-left">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
