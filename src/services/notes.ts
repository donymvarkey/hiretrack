import { supabase } from '@/lib/supabase'
import type { Note, NoteInsert } from '@/types'

export async function getNotesByApplication(applicationId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Note[]
}

export async function createNote(note: NoteInsert): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .insert(note as never)
    .select()
    .single()

  if (error) throw error
  return data as Note
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)

  if (error) throw error
}
