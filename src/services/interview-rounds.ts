import { supabase } from '@/lib/supabase'
import type { InterviewRoundInsert, InterviewRoundUpdate } from '@/types'

export async function getInterviewRoundsByApplication(applicationId: string) {
  const { data, error } = await supabase
    .from('interview_rounds')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function createInterviewRound(round: InterviewRoundInsert) {
  const { data, error } = await supabase
    .from('interview_rounds')
    .insert(round)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateInterviewRound(id: string, updates: InterviewRoundUpdate) {
  const { data, error } = await supabase
    .from('interview_rounds')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteInterviewRound(id: string) {
  const { error } = await supabase
    .from('interview_rounds')
    .delete()
    .eq('id', id)

  if (error) throw error
}
