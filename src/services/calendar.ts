import { supabase } from '@/lib/supabase'

export type CalendarEventType = 'interview' | 'follow_up'

export interface CalendarEvent {
  id: string
  date: string // ISO date string
  type: CalendarEventType
  title: string
  subtitle: string | null
  applicationId: string
  companyName: string
  jobRole: string | null
  status: string // round status or follow-up type
  isCompleted: boolean
  description: string | null
}

interface InterviewRoundRow {
  id: string
  application_id: string
  round_type: string
  scheduled_at: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes: string | null
  applications: { company_name: string; job_role: string | null } | null
}

interface FollowUpRow {
  id: string
  application_id: string
  follow_up_date: string
  type: 'callback' | 'interview' | 'email' | 'general'
  description: string | null
  is_completed: boolean
  applications: { company_name: string; job_role: string | null } | null
}

export async function getCalendarEvents(
  rangeStart: Date,
  rangeEnd: Date
): Promise<CalendarEvent[]> {
  const startISO = rangeStart.toISOString()
  const endISO = rangeEnd.toISOString()
  const startDate = rangeStart.toISOString().slice(0, 10)
  const endDate = rangeEnd.toISOString().slice(0, 10)

  const [interviewsResult, followUpsResult] = await Promise.all([
    supabase
      .from('interview_rounds')
      .select('id, application_id, round_type, scheduled_at, status, notes, applications(company_name, job_role)')
      .not('scheduled_at', 'is', null)
      .gte('scheduled_at', startISO)
      .lte('scheduled_at', endISO),

    supabase
      .from('follow_ups')
      .select('id, application_id, follow_up_date, type, description, is_completed, applications(company_name, job_role)')
      .gte('follow_up_date', startDate)
      .lte('follow_up_date', endDate),
  ])

  if (interviewsResult.error) throw interviewsResult.error
  if (followUpsResult.error) throw followUpsResult.error

  const interviews = (interviewsResult.data ?? []) as unknown as InterviewRoundRow[]
  const followUps = (followUpsResult.data ?? []) as unknown as FollowUpRow[]

  const interviewEvents: CalendarEvent[] = interviews.map((round) => ({
    id: `interview-${round.id}`,
    date: round.scheduled_at,
    type: 'interview',
    title: round.round_type,
    subtitle: round.applications?.company_name ?? 'Unknown Company',
    applicationId: round.application_id,
    companyName: round.applications?.company_name ?? 'Unknown',
    jobRole: round.applications?.job_role ?? null,
    status: round.status,
    isCompleted: round.status === 'completed',
    description: round.notes,
  }))

  const followUpEvents: CalendarEvent[] = followUps.map((followUp) => ({
    id: `followup-${followUp.id}`,
    date: followUp.follow_up_date,
    type: 'follow_up',
    title: followUp.description || `${followUp.type} follow-up`,
    subtitle: followUp.applications?.company_name ?? 'Unknown Company',
    applicationId: followUp.application_id,
    companyName: followUp.applications?.company_name ?? 'Unknown',
    jobRole: followUp.applications?.job_role ?? null,
    status: followUp.type,
    isCompleted: followUp.is_completed,
    description: followUp.description,
  }))

  return [...interviewEvents, ...followUpEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
}
