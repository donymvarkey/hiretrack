import { supabase } from '@/lib/supabase'
import type { ActivityLog, ActivityLogInsert, Application } from '@/types'

export async function getActivityLogsByApplication(applicationId: string): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ActivityLog[]
}

export async function createActivityLog(log: ActivityLogInsert): Promise<ActivityLog> {
  const { data, error } = await supabase
    .from('activity_logs')
    .insert(log as Record<string, unknown>)
    .select()
    .single()

  if (error) throw error
  return data as ActivityLog
}

export async function getDashboardStats() {
  const { data, error } = await supabase
    .from('applications')
    .select('status, created_at')

  if (error) throw error

  const applications = data as Pick<Application, 'status' | 'created_at'>[]

  const total = applications.length
  const active = applications.filter((a) =>
    !['rejected', 'joined', 'on_hold'].includes(a.status)
  ).length
  const offers = applications.filter((a) => a.status === 'offer_received').length
  const rejections = applications.filter((a) => a.status === 'rejected').length

  return { total, active, offers, rejections }
}
