export type ApplicationStatus =
  | 'hr_called'
  | 'applied'
  | 'resume_shared'
  | 'screening_round'
  | 'technical_round_1'
  | 'technical_round_2'
  | 'assignment_given'
  | 'managerial_round'
  | 'hr_round'
  | 'offer_received'
  | 'rejected'
  | 'joined'
  | 'on_hold'

export interface Database {
  public: {
    Tables: {
      applications: {
        Row: Application
        Insert: ApplicationInsert
        Update: ApplicationUpdate
      }
      interview_rounds: {
        Row: InterviewRound
        Insert: InterviewRoundInsert
        Update: InterviewRoundUpdate
      }
      notes: {
        Row: Note
        Insert: NoteInsert
        Update: NoteUpdate
      }
      follow_ups: {
        Row: FollowUp
        Insert: FollowUpInsert
        Update: FollowUpUpdate
      }
      activity_logs: {
        Row: ActivityLog
        Insert: ActivityLogInsert
        Update: ActivityLogUpdate
      }
    }
  }
}

export interface Application {
  id: string
  user_id: string
  company_name: string
  contact_number: string
  hr_name: string | null
  job_role: string | null
  company_website: string | null
  linkedin_profile: string | null
  email_address: string | null
  job_location: string | null
  salary_offered: string | null
  status: ApplicationStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ApplicationInsert {
  id?: string
  user_id?: string
  company_name: string
  contact_number: string
  hr_name?: string | null
  job_role?: string | null
  company_website?: string | null
  linkedin_profile?: string | null
  email_address?: string | null
  job_location?: string | null
  salary_offered?: string | null
  status?: ApplicationStatus
  notes?: string | null
  created_at?: string
  updated_at?: string
}

export interface ApplicationUpdate {
  company_name?: string
  contact_number?: string
  hr_name?: string | null
  job_role?: string | null
  company_website?: string | null
  linkedin_profile?: string | null
  email_address?: string | null
  job_location?: string | null
  salary_offered?: string | null
  status?: ApplicationStatus
  notes?: string | null
  updated_at?: string
}

export interface InterviewRound {
  id: string
  application_id: string
  user_id: string
  round_type: string
  scheduled_at: string | null
  completed_at: string | null
  feedback: string | null
  status: 'scheduled' | 'completed' | 'cancelled'
  notes: string | null
  created_at: string
}

export interface InterviewRoundInsert {
  id?: string
  application_id: string
  user_id?: string
  round_type: string
  scheduled_at?: string | null
  completed_at?: string | null
  feedback?: string | null
  status?: 'scheduled' | 'completed' | 'cancelled'
  notes?: string | null
  created_at?: string
}

export interface InterviewRoundUpdate {
  round_type?: string
  scheduled_at?: string | null
  completed_at?: string | null
  feedback?: string | null
  status?: 'scheduled' | 'completed' | 'cancelled'
  notes?: string | null
}

export interface Note {
  id: string
  application_id: string
  user_id: string
  content: string
  created_at: string
}

export interface NoteInsert {
  id?: string
  application_id: string
  user_id?: string
  content: string
  created_at?: string
}

export interface NoteUpdate {
  content?: string
}

export interface FollowUp {
  id: string
  application_id: string
  user_id: string
  follow_up_date: string
  type: 'callback' | 'interview' | 'email' | 'general'
  description: string | null
  is_completed: boolean
  created_at: string
}

export interface FollowUpInsert {
  id?: string
  application_id: string
  user_id?: string
  follow_up_date: string
  type?: 'callback' | 'interview' | 'email' | 'general'
  description?: string | null
  is_completed?: boolean
  created_at?: string
}

export interface FollowUpUpdate {
  follow_up_date?: string
  type?: 'callback' | 'interview' | 'email' | 'general'
  description?: string | null
  is_completed?: boolean
}

export interface ActivityLog {
  id: string
  application_id: string
  user_id: string
  action: string
  details: string | null
  created_at: string
}

export interface ActivityLogInsert {
  id?: string
  application_id: string
  user_id?: string
  action: string
  details?: string | null
  created_at?: string
}

export interface ActivityLogUpdate {
  action?: string
  details?: string | null
}
