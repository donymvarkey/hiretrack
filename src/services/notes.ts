import { supabase } from '@/lib/supabase'
import type { NoteInsert } from '@/types'

export async function getNotesByApplication(applicationId: string) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createNote(note: NoteInsert) {
  const { data, error } = await supabase
    .from('notes')
    .insert(note)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteNote(id: string) {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)

  if (error) throw error
}
