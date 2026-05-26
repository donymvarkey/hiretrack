import { supabase } from '@/lib/supabase'
import type { ApplicationInsert, ApplicationUpdate } from '@/types'

export async function getApplications() {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getApplication(id: string) {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createApplication(application: ApplicationInsert) {
  const { data, error } = await supabase
    .from('applications')
    .insert(application)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateApplication(id: string, updates: ApplicationUpdate) {
  const { data, error } = await supabase
    .from('applications')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteApplication(id: string) {
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function searchApplications(query: string) {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .or(`company_name.ilike.%${query}%,hr_name.ilike.%${query}%,job_role.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
