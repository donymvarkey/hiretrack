import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { updateApplication } from '@/services/applications'
import { applicationSchema, type ApplicationFormData } from '@/lib/validations'
import { APPLICATION_STATUSES, type Application } from '@/types'

interface EditApplicationModalProps {
  application: Application
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditApplicationModal({ application, open, onOpenChange }: EditApplicationModalProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      company_name: application.company_name,
      contact_number: application.contact_number,
      hr_name: application.hr_name ?? '',
      job_role: application.job_role ?? '',
      company_website: application.company_website ?? '',
      linkedin_profile: application.linkedin_profile ?? '',
      email_address: application.email_address ?? '',
      job_location: application.job_location ?? '',
      salary_offered: application.salary_offered ?? '',
      status: application.status,
      notes: application.notes ?? '',
    },
  })

  const mutation = useMutation({
    mutationFn: (data: ApplicationFormData) =>
      updateApplication(application.id, {
        company_name: data.company_name,
        contact_number: data.contact_number,
        hr_name: data.hr_name || null,
        job_role: data.job_role || null,
        company_website: data.company_website || null,
        linkedin_profile: data.linkedin_profile || null,
        email_address: data.email_address || null,
        job_location: data.job_location || null,
        salary_offered: data.salary_offered || null,
        status: data.status,
        notes: data.notes || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', application.id] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      onOpenChange(false)
    },
  })

  const onSubmit = (data: ApplicationFormData) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Application</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_company_name">Company Name *</Label>
              <Input id="edit_company_name" {...register('company_name')} />
              {errors.company_name && (
                <p className="text-xs text-red-400">{errors.company_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_contact_number">Contact Number *</Label>
              <Input id="edit_contact_number" type="tel" {...register('contact_number')} />
              {errors.contact_number && (
                <p className="text-xs text-red-400">{errors.contact_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_hr_name">HR/Recruiter Name</Label>
              <Input id="edit_hr_name" {...register('hr_name')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_job_role">Job Role</Label>
              <Input id="edit_job_role" {...register('job_role')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_job_location">Location</Label>
              <Input id="edit_job_location" {...register('job_location')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_salary_offered">Salary Offered</Label>
              <Input id="edit_salary_offered" {...register('salary_offered')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_email_address">Email</Label>
              <Input id="edit_email_address" type="email" {...register('email_address')} />
              {errors.email_address && (
                <p className="text-xs text-red-400">{errors.email_address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_company_website">Company Website</Label>
              <Input id="edit_company_website" type="url" {...register('company_website')} />
              {errors.company_website && (
                <p className="text-xs text-red-400">{errors.company_website.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_linkedin_profile">LinkedIn Profile</Label>
              <Input id="edit_linkedin_profile" type="url" {...register('linkedin_profile')} />
              {errors.linkedin_profile && (
                <p className="text-xs text-red-400">{errors.linkedin_profile.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_status">Status</Label>
              <Select id="edit_status" {...register('status')}>
                {Object.entries(APPLICATION_STATUSES).map(([value, { label }]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_notes">Notes</Label>
            <Textarea id="edit_notes" rows={3} {...register('notes')} />
          </div>

          {mutation.isError && (
            <p className="text-xs text-red-400">Failed to update. Please try again.</p>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Spinner size="sm" /> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
