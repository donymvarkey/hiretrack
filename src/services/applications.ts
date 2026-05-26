import { supabase } from '@/lib/supabase'
import type { Application, ApplicationInsert, ApplicationUpdate } from '@/types'

export async function getApplications(): Promise<Application[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Application[]
}

export async function getApplication(id: string): Promise<Application> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Application
}

export async function createApplication(application: ApplicationInsert): Promise<Application> {
  const { data, error } = await supabase
    .from('applications')
    .insert(application as never)
    .select()
    .single()

  if (error) throw error
  return data as Application
}

export async function updateApplication(id: string, updates: ApplicationUpdate): Promise<Application> {
  const { data, error } = await supabase
    .from('applications')
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Application
}

export async function deleteApplication(id: string): Promise<void> {
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function searchApplications(query: string): Promise<Application[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .or(`company_name.ilike.%${query}%,hr_name.ilike.%${query}%,job_role.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Application[]
}
