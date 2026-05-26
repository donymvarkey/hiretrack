import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Plus, Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import {
  getFollowUpsByApplication,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp,
} from '@/services/follow-ups'
import { followUpSchema, type FollowUpFormData } from '@/lib/validations'
import { formatDate } from '@/lib/utils'
import { FOLLOW_UP_TYPES } from '@/types'

interface FollowUpSectionProps {
  applicationId: string
}

export function FollowUpSection({ applicationId }: FollowUpSectionProps) {
  const [addOpen, setAddOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: followUps, isLoading } = useQuery({
    queryKey: ['follow-ups', applicationId],
    queryFn: () => getFollowUpsByApplication(applicationId),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FollowUpFormData>({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      follow_up_date: '',
      type: 'general',
      description: '',
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: FollowUpFormData) =>
      createFollowUp({
        application_id: applicationId,
        follow_up_date: data.follow_up_date,
        type: data.type,
        description: data.description || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-ups', applicationId] })
      queryClient.invalidateQueries({ queryKey: ['pending-follow-ups'] })
      reset()
      setAddOpen(false)
    },
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => updateFollowUp(id, { is_completed: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-ups', applicationId] })
      queryClient.invalidateQueries({ queryKey: ['pending-follow-ups'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteFollowUp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-ups', applicationId] })
      queryClient.invalidateQueries({ queryKey: ['pending-follow-ups'] })
    },
  })

  const onSubmit = (data: FollowUpFormData) => {
    createMutation.mutate(data)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Follow-ups
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : followUps && followUps.length > 0 ? (
          <div className="space-y-2">
            {followUps.map((followUp) => {
              const typeInfo = FOLLOW_UP_TYPES[followUp.type as keyof typeof FOLLOW_UP_TYPES]
              const isOverdue = !followUp.is_completed && new Date(followUp.follow_up_date) < new Date()
              return (
                <div
                  key={followUp.id}
                  className={`flex items-center justify-between gap-2 p-2 rounded-lg ${
                    followUp.is_completed ? 'opacity-50' : ''
                  } ${isOverdue ? 'bg-red-500/5' : 'bg-muted/50'}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-xs font-medium ${typeInfo?.color ?? ''}`}>
                      {typeInfo?.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(followUp.follow_up_date)}
                    </span>
                    {followUp.description && (
                      <span className="text-xs text-muted-foreground truncate">
                        — {followUp.description}
                      </span>
                    )}
                    {isOverdue && (
                      <span className="text-xs text-red-400">Overdue</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!followUp.is_completed && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => completeMutation.mutate(followUp.id)}
                        title="Mark complete"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => deleteMutation.mutate(followUp.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            No follow-ups scheduled
          </p>
        )}
      </CardContent>

      {/* Add Follow-up Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent onClose={() => setAddOpen(false)}>
          <DialogHeader>
            <DialogTitle>Add Follow-up</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="follow_up_date">Date</Label>
              <Input
                id="follow_up_date"
                type="date"
                {...register('follow_up_date')}
              />
              {errors.follow_up_date && (
                <p className="text-xs text-red-400">{errors.follow_up_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select id="type" {...register('type')}>
                <option value="general">General</option>
                <option value="callback">Callback</option>
                <option value="interview">Interview</option>
                <option value="email">Email</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description..."
                {...register('description')}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Spinner size="sm" /> : 'Add Follow-up'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
