export type {
  Database,
  Application,
  ApplicationInsert,
  ApplicationUpdate,
  ApplicationStatus,
  InterviewRound,
  InterviewRoundInsert,
  InterviewRoundUpdate,
  Note,
  NoteInsert,
  NoteUpdate,
  FollowUp,
  FollowUpInsert,
  FollowUpUpdate,
  ActivityLog,
  ActivityLogInsert,
  ActivityLogUpdate,
} from './database'

export const APPLICATION_STATUSES: Record<string, { label: string; color: string }> = {
  hr_called: { label: 'HR Called', color: 'bg-blue-500/20 text-blue-400' },
  applied: { label: 'Applied', color: 'bg-indigo-500/20 text-indigo-400' },
  resume_shared: { label: 'Resume Shared', color: 'bg-purple-500/20 text-purple-400' },
  screening_round: { label: 'Screening Round', color: 'bg-cyan-500/20 text-cyan-400' },
  technical_round_1: { label: 'Technical Round 1', color: 'bg-teal-500/20 text-teal-400' },
  technical_round_2: { label: 'Technical Round 2', color: 'bg-emerald-500/20 text-emerald-400' },
  assignment_given: { label: 'Assignment Given', color: 'bg-amber-500/20 text-amber-400' },
  managerial_round: { label: 'Managerial Round', color: 'bg-orange-500/20 text-orange-400' },
  hr_round: { label: 'HR Round', color: 'bg-pink-500/20 text-pink-400' },
  offer_received: { label: 'Offer Received', color: 'bg-green-500/20 text-green-400' },
  rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-400' },
  joined: { label: 'Joined', color: 'bg-green-600/20 text-green-300' },
  on_hold: { label: 'On Hold', color: 'bg-gray-500/20 text-gray-400' },
}

export const FOLLOW_UP_TYPES = {
  callback: { label: 'Callback', color: 'text-blue-400' },
  interview: { label: 'Interview', color: 'text-purple-400' },
  email: { label: 'Email', color: 'text-cyan-400' },
  general: { label: 'General', color: 'text-gray-400' },
}
