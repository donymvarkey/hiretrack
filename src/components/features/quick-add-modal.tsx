import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { useAppStore } from '@/store/app-store'
import { createApplication } from '@/services/applications'
import { quickAddSchema, type QuickAddFormData } from '@/lib/validations'
import { Phone } from 'lucide-react'

export function QuickAddModal() {
  const { quickAddOpen, setQuickAddOpen } = useAppStore()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuickAddFormData>({
    resolver: zodResolver(quickAddSchema),
  })

  const mutation = useMutation({
    mutationFn: (data: QuickAddFormData) =>
      createApplication({
        company_name: data.company_name,
        contact_number: data.contact_number,
        hr_name: data.hr_name || null,
        notes: data.notes || null,
        status: 'hr_called',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      reset()
      setQuickAddOpen(false)
    },
  })

  const onSubmit = (data: QuickAddFormData) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
      <DialogContent onClose={() => setQuickAddOpen(false)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Quick Add HR Call
          </DialogTitle>
          <DialogDescription>
            Quickly save details from an HR/recruiter call
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name *</Label>
            <Input
              id="company_name"
              placeholder="e.g. Google, Microsoft..."
              autoFocus
              {...register('company_name')}
            />
            {errors.company_name && (
              <p className="text-xs text-red-400">{errors.company_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_number">Contact Number *</Label>
            <Input
              id="contact_number"
              placeholder="+1 234 567 8900"
              type="tel"
              {...register('contact_number')}
            />
            {errors.contact_number && (
              <p className="text-xs text-red-400">{errors.contact_number.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hr_name">Recruiter Name</Label>
            <Input
              id="hr_name"
              placeholder="Name of the HR/recruiter"
              {...register('hr_name')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Quick notes about the call..."
              rows={3}
              {...register('notes')}
            />
          </div>

          {mutation.isError && (
            <p className="text-xs text-red-400">
              Failed to save. Please try again.
            </p>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setQuickAddOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Spinner size="sm" /> : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
