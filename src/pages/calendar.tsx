import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { getCalendarEvents, type CalendarEvent } from '@/services/calendar'
import {
  getMonthGrid,
  getMonthRange,
  formatMonthYear,
  formatTime,
  WEEKDAYS,
} from '@/lib/calendar-utils'
import { cn } from '@/lib/utils'
import { DayEventsModal } from '@/components/features/day-events-modal'

export function CalendarPage() {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const { start, end } = useMemo(
    () => getMonthRange(viewYear, viewMonth),
    [viewYear, viewMonth]
  )

  const { data: events, isLoading } = useQuery({
    queryKey: ['calendar-events', start.toISOString(), end.toISOString()],
    queryFn: () => getCalendarEvents(start, end),
  })

  const days = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth])

  // Group events by date key (YYYY-MM-DD)
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    if (!events) return map
    for (const event of events) {
      const key = event.date.slice(0, 10)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(event)
    }
    return map
  }, [events])

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const handleToday = () => {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
  }

  const selectedDateEvents = selectedDate
    ? eventsByDate.get(
        `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
      ) ?? []
    : []

  // Upcoming events (next 5 from today)
  const upcomingEvents = useMemo(() => {
    if (!events) return []
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    return events
      .filter((e) => e.date.slice(0, 10) >= todayKey && !e.isCompleted)
      .slice(0, 5)
  }, [events, today])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-sm text-muted-foreground">
            View interviews and follow-ups at a glance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{formatMonthYear(viewYear, viewMonth)}</h2>
              {isLoading && <Spinner size="sm" />}
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="text-xs font-medium text-muted-foreground text-center py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const dayEvents = eventsByDate.get(day.dateKey) ?? []
                const interviewCount = dayEvents.filter((e) => e.type === 'interview').length
                const followUpCount = dayEvents.filter((e) => e.type === 'follow_up').length
                const hasEvents = dayEvents.length > 0

                return (
                  <button
                    key={day.dateKey}
                    onClick={() => hasEvents && setSelectedDate(day.date)}
                    disabled={!hasEvents}
                    className={cn(
                      'aspect-square sm:aspect-auto sm:min-h-[80px] rounded-lg border p-1.5 sm:p-2 text-left transition-colors flex flex-col',
                      day.isCurrentMonth ? 'bg-background' : 'bg-muted/20',
                      day.isToday && 'border-primary/60 ring-1 ring-primary/30',
                      hasEvents && 'cursor-pointer hover:bg-accent',
                      !hasEvents && 'cursor-default'
                    )}
                  >
                    <span
                      className={cn(
                        'text-xs sm:text-sm',
                        day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/50',
                        day.isToday && 'font-bold text-primary'
                      )}
                    >
                      {day.date.getDate()}
                    </span>

                    {hasEvents && (
                      <div className="mt-1 flex-1 flex flex-col gap-0.5 overflow-hidden">
                        {/* Mobile: just dots */}
                        <div className="flex gap-0.5 sm:hidden">
                          {interviewCount > 0 && (
                            <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                          )}
                          {followUpCount > 0 && (
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                          )}
                        </div>

                        {/* Desktop: event pills */}
                        <div className="hidden sm:flex flex-col gap-0.5">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className={cn(
                                'text-[10px] truncate px-1 py-0.5 rounded',
                                event.type === 'interview'
                                  ? 'bg-purple-500/20 text-purple-300'
                                  : 'bg-amber-500/20 text-amber-300',
                                event.isCompleted && 'opacity-50 line-through'
                              )}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-[10px] text-muted-foreground px-1">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-purple-400" />
                Interview
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-amber-400" />
                Follow-up
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Sidebar */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Upcoming
            </h3>
            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                Nothing scheduled
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => {
                  const eventDate = new Date(event.date)
                  const time = formatTime(event.date)
                  return (
                    <button
                      key={event.id}
                      onClick={() => setSelectedDate(eventDate)}
                      className="w-full text-left p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={cn(
                            'h-2 w-2 rounded-full mt-1.5 shrink-0',
                            event.type === 'interview' ? 'bg-purple-400' : 'bg-amber-400'
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{event.title}</p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {event.companyName}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {eventDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                            {time && ` · ${time}`}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DayEventsModal
        date={selectedDate}
        events={selectedDateEvents}
        onClose={() => setSelectedDate(null)}
      />
    </div>
  )
}
