import { supabase } from '@/lib/supabase'
import type { InterviewRound, InterviewRoundInsert, InterviewRoundUpdate } from '@/types'

export async function getInterviewRoundsByApplication(applicationId: string): Promise<InterviewRound[]> {
  const { data, error } = await supabase
    .from('interview_rounds')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as InterviewRound[]
}

export async function createInterviewRound(round: InterviewRoundInsert): Promise<InterviewRound> {
  const { data, error } = await supabase
    .from('interview_rounds')
    .insert(round as never)
    .select()
    .single()

  if (error) throw error
  return data as InterviewRound
}

export async function updateInterviewRound(id: string, updates: InterviewRoundUpdate): Promise<InterviewRound> {
  const { data, error } = await supabase
    .from('interview_rounds')
    .update(updates as never)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as InterviewRound
}

export async function deleteInterviewRound(id: string): Promise<void> {
  const { error } = await supabase
    .from('interview_rounds')
    .delete()
    .eq('id', id)

  if (error) throw error
}
