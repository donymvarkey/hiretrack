import { supabase } from '@/lib/supabase'
import type { FollowUpInsert, FollowUpUpdate } from '@/types'

export async function getFollowUps() {
  const { data, error } = await supabase
    .from('follow_ups')
    .select('*, applications(company_name, job_role)')
    .order('follow_up_date', { ascending: true })

  if (error) throw error
  return data
}

export async function getFollowUpsByApplication(applicationId: string) {
  const { data, error } = await supabase
    .from('follow_ups')
    .select('*')
    .eq('application_id', applicationId)
    .order('follow_up_date', { ascending: true })

  if (error) throw error
  return data
}

export async function getPendingFollowUps() {
  const { data, error } = await supabase
    .from('follow_ups')
    .select('*, applications(company_name, job_role)')
    .eq('is_completed', false)
    .order('follow_up_date', { ascending: true })

  if (error) throw error
  return data
}

export async function createFollowUp(followUp: FollowUpInsert) {
  const { data, error } = await supabase
    .from('follow_ups')
    .insert(followUp)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateFollowUp(id: string, updates: FollowUpUpdate) {
  const { data, error } = await supabase
    .from('follow_ups')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteFollowUp(id: string) {
  const { error } = await supabase
    .from('follow_ups')
    .delete()
    .eq('id', id)

  if (error) throw error
}
