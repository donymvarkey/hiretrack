import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 py-16 px-6 text-center">
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-2xl bg-brand-gradient opacity-20 blur-xl" />
        <div className="relative rounded-2xl border border-border bg-card p-4 shadow-sm">
          <Icon className="h-8 w-8 text-primary" />
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground mb-5 max-w-sm">{description}</p>
      {action}
    </div>
  )
}
