export interface CalendarDay {
  date: Date
  dateKey: string // YYYY-MM-DD
  isCurrentMonth: boolean
  isToday: boolean
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isSameDayKey(a: Date | string, b: Date | string): boolean {
  const keyA = typeof a === 'string' ? a.slice(0, 10) : toDateKey(a)
  const keyB = typeof b === 'string' ? b.slice(0, 10) : toDateKey(b)
  return keyA === keyB
}

export function getMonthGrid(year: number, month: number): CalendarDay[] {
  const firstOfMonth = new Date(year, month, 1)
  const startDay = firstOfMonth.getDay() // 0 = Sunday
  const gridStart = new Date(year, month, 1 - startDay)

  const today = new Date()
  const todayKey = toDateKey(today)

  const days: CalendarDay[] = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + i)
    const dateKey = toDateKey(date)
    days.push({
      date,
      dateKey,
      isCurrentMonth: date.getMonth() === month,
      isToday: dateKey === todayKey,
    })
  }

  return days
}

export function getMonthRange(year: number, month: number): { start: Date; end: Date } {
  const firstOfMonth = new Date(year, month, 1)
  const startDay = firstOfMonth.getDay()
  const start = new Date(year, month, 1 - startDay)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(end.getDate() + 41)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

export function formatMonthYear(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString)
  // Check if it has a time component (interview rounds have datetime, follow-ups are date-only)
  if (isoString.includes('T')) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }
  return ''
}

export function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
