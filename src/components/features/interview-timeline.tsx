import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Clock, Plus, CheckCircle2, XCircle, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import {
  getInterviewRoundsByApplication,
  createInterviewRound,
  updateInterviewRound,
} from '@/services/interview-rounds'
import { interviewRoundSchema, type InterviewRoundFormData } from '@/lib/validations'
import { formatDate } from '@/lib/utils'

interface InterviewTimelineProps {
  applicationId: string
}

export function InterviewTimeline({ applicationId }: InterviewTimelineProps) {
  const [addOpen, setAddOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: rounds, isLoading } = useQuery({
    queryKey: ['interview-rounds', applicationId],
    queryFn: () => getInterviewRoundsByApplication(applicationId),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InterviewRoundFormData>({
    resolver: zodResolver(interviewRoundSchema),
  })

  const createMutation = useMutation({
    mutationFn: (data: InterviewRoundFormData) =>
      createInterviewRound({
        application_id: applicationId,
        round_type: data.round_type,
        scheduled_at: data.scheduled_at || null,
        notes: data.notes || null,
        status: data.status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview-rounds', applicationId] })
      reset()
      setAddOpen(false)
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'scheduled' | 'completed' | 'cancelled' }) =>
      updateInterviewRound(id, {
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview-rounds', applicationId] })
    },
  })

  const onSubmit = (data: InterviewRoundFormData) => {
    createMutation.mutate(data)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-400" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <Circle className="h-4 w-4 text-blue-400" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Interview Timeline
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-3 w-3 mr-1" />
            Add Round
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : rounds && rounds.length > 0 ? (
          <div className="relative space-y-4">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

            {rounds.map((round) => (
              <div key={round.id} className="flex gap-3 relative">
                <div className="mt-1 shrink-0 z-10 bg-background">
                  {getStatusIcon(round.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{round.round_type}</p>
                    <Select
                      value={round.status}
                      onChange={(e) =>
                        statusMutation.mutate({
                          id: round.id,
                          status: e.target.value as 'scheduled' | 'completed' | 'cancelled',
                        })
                      }
                      className="w-28 h-7 text-xs"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </Select>
                  </div>
                  {round.scheduled_at && (
                    <p className="text-xs text-muted-foreground">
                      {formatDate(round.scheduled_at)}
                    </p>
                  )}
                  {round.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{round.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            No interview rounds added yet
          </p>
        )}
      </CardContent>

      {/* Add Round Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent onClose={() => setAddOpen(false)}>
          <DialogHeader>
            <DialogTitle>Add Interview Round</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="round_type">Round Type</Label>
              <Select id="round_type" {...register('round_type')}>
                <option value="">Select round type</option>
                <option value="Screening">Screening</option>
                <option value="Technical Round 1">Technical Round 1</option>
                <option value="Technical Round 2">Technical Round 2</option>
                <option value="Assignment">Assignment</option>
                <option value="Managerial Round">Managerial Round</option>
                <option value="HR Round">HR Round</option>
                <option value="Culture Fit">Culture Fit</option>
                <option value="Final Round">Final Round</option>
              </Select>
              {errors.round_type && (
                <p className="text-xs text-red-400">{errors.round_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled_at">Scheduled Date</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                {...register('scheduled_at')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="round_notes">Notes</Label>
              <Textarea
                id="round_notes"
                placeholder="Any notes about this round..."
                rows={2}
                {...register('notes')}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Spinner size="sm" /> : 'Add Round'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
