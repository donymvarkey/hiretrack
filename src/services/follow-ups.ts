import { supabase } from '@/lib/supabase'
import type { FollowUp, FollowUpInsert, FollowUpUpdate } from '@/types'

export interface FollowUpWithApplication extends FollowUp {
  applications: { company_name: string; job_role: string | null } | null
}

export async function getFollowUps(): Promise<FollowUpWithApplication[]> {
  const { data, error } = await supabase
    .from('follow_ups')
    .select('*, applications(company_name, job_role)')
    .order('follow_up_date', { ascending: true })

  if (error) throw error
  return data as FollowUpWithApplication[]
}

export async function getFollowUpsByApplication(applicationId: string): Promise<FollowUp[]> {
  const { data, error } = await supabase
    .from('follow_ups')
    .select('*')
    .eq('application_id', applicationId)
    .order('follow_up_date', { ascending: true })

  if (error) throw error
  return data as FollowUp[]
}

export async function getPendingFollowUps(): Promise<FollowUpWithApplication[]> {
  const { data, error } = await supabase
    .from('follow_ups')
    .select('*, applications(company_name, job_role)')
    .eq('is_completed', false)
    .order('follow_up_date', { ascending: true })

  if (error) throw error
  return data as FollowUpWithApplication[]
}

export async function createFollowUp(followUp: FollowUpInsert): Promise<FollowUp> {
  const { data, error } = await supabase
    .from('follow_ups')
    .insert(followUp as Record<string, unknown>)
    .select()
    .single()

  if (error) throw error
  return data as FollowUp
}

export async function updateFollowUp(id: string, updates: FollowUpUpdate): Promise<FollowUp> {
  const { data, error } = await supabase
    .from('follow_ups')
    .update(updates as Record<string, unknown>)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as FollowUp
}

export async function deleteFollowUp(id: string): Promise<void> {
  const { error } = await supabase
    .from('follow_ups')
    .delete()
    .eq('id', id)

  if (error) throw error
}
