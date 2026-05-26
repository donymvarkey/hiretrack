import { supabase } from '@/lib/supabase'
import type { ActivityLogInsert } from '@/types'

export async function getActivityLogsByApplication(applicationId: string) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createActivityLog(log: ActivityLogInsert) {
  const { data, error } = await supabase
    .from('activity_logs')
    .insert(log)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getDashboardStats() {
  const { data: applications, error } = await supabase
    .from('applications')
    .select('status, created_at')

  if (error) throw error

  const total = applications.length
  const active = applications.filter((a) =>
    !['rejected', 'joined', 'on_hold'].includes(a.status)
  ).length
  const offers = applications.filter((a) => a.status === 'offer_received').length
  const rejections = applications.filter((a) => a.status === 'rejected').length

  return { total, active, offers, rejections }
}
