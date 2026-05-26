import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Check, Trash2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { getFollowUps, updateFollowUp, deleteFollowUp } from '@/services/follow-ups'
import { FOLLOW_UP_TYPES } from '@/types'
import { formatDate } from '@/lib/utils'
import { Link } from 'react-router-dom'

export function FollowUpsPage() {
  const queryClient = useQueryClient()

  const { data: followUps, isLoading } = useQuery({
    queryKey: ['all-follow-ups'],
    queryFn: getFollowUps,
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => updateFollowUp(id, { is_completed: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-follow-ups'] })
      queryClient.invalidateQueries({ queryKey: ['pending-follow-ups'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteFollowUp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-follow-ups'] })
      queryClient.invalidateQueries({ queryKey: ['pending-follow-ups'] })
    },
  })

  if (isLoading) return <PageLoader />

  const pending = (followUps ?? []).filter((f) => !f.is_completed)
  const completed = (followUps ?? []).filter((f) => f.is_completed)

  if (!followUps || followUps.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Follow-ups</h1>
          <p className="text-sm text-muted-foreground">Track your pending callbacks and reminders</p>
        </div>
        <EmptyState
          icon={Bell}
          title="No follow-ups yet"
          description="Follow-ups will appear here when you add them to your applications"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Follow-ups</h1>
        <p className="text-sm text-muted-foreground">
          {pending.length} pending · {completed.length} completed
        </p>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Pending
          </h2>
          {pending.map((followUp) => {
            const app = (followUp as Record<string, unknown>).applications as { company_name: string; job_role: string | null } | null
            const typeInfo = FOLLOW_UP_TYPES[followUp.type as keyof typeof FOLLOW_UP_TYPES]
            const isOverdue = new Date(followUp.follow_up_date) < new Date()

            return (
              <Card key={followUp.id} className={isOverdue ? 'border-red-500/30' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Calendar className={`h-4 w-4 shrink-0 ${isOverdue ? 'text-red-400' : 'text-muted-foreground'}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/applications/${followUp.application_id}`}
                            className="text-sm font-medium hover:underline truncate"
                          >
                            {app?.company_name ?? 'Unknown'}
                          </Link>
                          <Badge className={`text-xs ${typeInfo?.color ?? ''}`}>
                            {typeInfo?.label}
                          </Badge>
                          {isOverdue && (
                            <Badge className="bg-red-500/20 text-red-400 text-xs">Overdue</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(followUp.follow_up_date)}
                          {followUp.description && ` — ${followUp.description}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => completeMutation.mutate(followUp.id)}
                        title="Mark complete"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => deleteMutation.mutate(followUp.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Completed
          </h2>
          {completed.map((followUp) => {
            const app = (followUp as Record<string, unknown>).applications as { company_name: string; job_role: string | null } | null
            const typeInfo = FOLLOW_UP_TYPES[followUp.type as keyof typeof FOLLOW_UP_TYPES]

            return (
              <Card key={followUp.id} className="opacity-60">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Check className="h-4 w-4 text-green-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {app?.company_name ?? 'Unknown'}
                          </span>
                          <Badge className={`text-xs ${typeInfo?.color ?? ''}`}>
                            {typeInfo?.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(followUp.follow_up_date)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => deleteMutation.mutate(followUp.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
