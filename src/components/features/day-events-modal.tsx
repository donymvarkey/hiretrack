import { Link } from 'react-router-dom'
import { Calendar, Clock, Bell, ExternalLink, CheckCircle2, XCircle, Circle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { formatFullDate, formatTime } from '@/lib/calendar-utils'
import { FOLLOW_UP_TYPES } from '@/types'
import type { CalendarEvent } from '@/services/calendar'

interface DayEventsModalProps {
  date: Date | null
  events: CalendarEvent[]
  onClose: () => void
}

export function DayEventsModal({ date, events, onClose }: DayEventsModalProps) {
  const open = date !== null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent onClose={onClose} className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {date ? formatFullDate(date) : ''}
          </DialogTitle>
        </DialogHeader>

        {events.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Nothing scheduled"
            description="No interviews or follow-ups for this day"
          />
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {events.map((event) => (
              <EventCard key={event.id} event={event} onClose={onClose} />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function EventCard({ event, onClose }: { event: CalendarEvent; onClose: () => void }) {
  const isInterview = event.type === 'interview'
  const time = formatTime(event.date)

  const StatusIcon = isInterview
    ? event.status === 'completed'
      ? CheckCircle2
      : event.status === 'cancelled'
      ? XCircle
      : Circle
    : Bell

  const statusColor = isInterview
    ? event.status === 'completed'
      ? 'text-green-400'
      : event.status === 'cancelled'
      ? 'text-red-400'
      : 'text-blue-400'
    : event.isCompleted
    ? 'text-green-400'
    : 'text-amber-400'

  const typeBadge = isInterview ? (
    <Badge className="bg-purple-500/20 text-purple-400 text-xs">Interview</Badge>
  ) : (
    <Badge className={`text-xs ${FOLLOW_UP_TYPES[event.status as keyof typeof FOLLOW_UP_TYPES]?.color ?? ''}`}>
      {FOLLOW_UP_TYPES[event.status as keyof typeof FOLLOW_UP_TYPES]?.label ?? 'Follow-up'}
    </Badge>
  )

  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <StatusIcon className={`h-4 w-4 mt-0.5 shrink-0 ${statusColor}`} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium truncate">{event.title}</p>
              {typeBadge}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {event.companyName}
              {event.jobRole && ` · ${event.jobRole}`}
            </p>
          </div>
        </div>
        {time && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Clock className="h-3 w-3" />
            {time}
          </div>
        )}
      </div>

      {event.description && event.title !== event.description && (
        <p className="text-xs text-muted-foreground pl-6">{event.description}</p>
      )}

      <div className="flex justify-end pt-1">
        <Link to={`/applications/${event.applicationId}`} onClick={onClose}>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
            View application
            <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
