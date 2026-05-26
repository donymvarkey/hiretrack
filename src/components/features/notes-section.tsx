import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, Send, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { getNotesByApplication, createNote, deleteNote } from '@/services/notes'
import { noteSchema, type NoteFormData } from '@/lib/validations'
import { formatRelativeDate } from '@/lib/utils'

interface NotesSectionProps {
  applicationId: string
}

export function NotesSection({ applicationId }: NotesSectionProps) {
  const queryClient = useQueryClient()

  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes', applicationId],
    queryFn: () => getNotesByApplication(applicationId),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
  })

  const createMutation = useMutation({
    mutationFn: (data: NoteFormData) =>
      createNote({ application_id: applicationId, content: data.content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', applicationId] })
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', applicationId] })
    },
  })

  const onSubmit = (data: NoteFormData) => {
    createMutation.mutate(data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Note Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
          <div className="flex-1">
            <Textarea
              placeholder="Add a note..."
              rows={2}
              {...register('content')}
            />
            {errors.content && (
              <p className="text-xs text-red-400 mt-1">{errors.content.message}</p>
            )}
          </div>
          <Button type="submit" size="icon" disabled={createMutation.isPending}>
            {createMutation.isPending ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>

        {/* Notes List */}
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : notes && notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="flex items-start justify-between gap-2 p-3 rounded-lg bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatRelativeDate(note.created_at)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-7 w-7"
                  onClick={() => deleteMutation.mutate(note.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            No notes yet
          </p>
        )}
      </CardContent>
    </Card>
  )
}
