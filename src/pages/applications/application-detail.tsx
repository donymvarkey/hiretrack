import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Building2,
  Phone,
  User,
  MapPin,
  Globe,
  Link2,
  Mail,
  DollarSign,
  Trash2,
  Edit,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { PageLoader } from '@/components/ui/spinner'
import { getApplication, updateApplication, deleteApplication } from '@/services/applications'
import { APPLICATION_STATUSES, type ApplicationStatus } from '@/types'
import { formatDate } from '@/lib/utils'
import { NotesSection } from '@/components/features/notes-section'
import { InterviewTimeline } from '@/components/features/interview-timeline'
import { FollowUpSection } from '@/components/features/follow-up-section'
import { EditApplicationModal } from '@/components/features/edit-application-modal'

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)

  const { data: application, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => getApplication(id!),
    enabled: !!id,
  })

  const statusMutation = useMutation({
    mutationFn: (status: ApplicationStatus) => updateApplication(id!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteApplication(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      navigate('/applications')
    },
  })

  if (isLoading) return <PageLoader />
  if (!application) return <div>Application not found</div>

  const statusInfo = APPLICATION_STATUSES[application.status]

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      deleteMutation.mutate()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/applications')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{application.company_name}</h1>
            <p className="text-sm text-muted-foreground">
              {application.job_role || 'No role specified'} · Added {formatDate(application.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Status Update */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge className={statusInfo?.color}>{statusInfo?.label}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Update to:</span>
              <Select
                value={application.status}
                onChange={(e) => statusMutation.mutate(e.target.value as ApplicationStatus)}
                className="w-48"
              >
                {Object.entries(APPLICATION_STATUSES).map(([value, { label }]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow icon={Building2} label="Company" value={application.company_name} />
            <DetailRow icon={Phone} label="Contact" value={application.contact_number} />
            {application.hr_name && <DetailRow icon={User} label="HR/Recruiter" value={application.hr_name} />}
            {application.job_location && <DetailRow icon={MapPin} label="Location" value={application.job_location} />}
            {application.salary_offered && <DetailRow icon={DollarSign} label="Salary" value={application.salary_offered} />}
            {application.email_address && <DetailRow icon={Mail} label="Email" value={application.email_address} />}
            {application.company_website && (
              <DetailRow
                icon={Globe}
                label="Website"
                value={application.company_website}
                isLink
              />
            )}
            {application.linkedin_profile && (
              <DetailRow
                icon={Link2}
                label="LinkedIn"
                value={application.linkedin_profile}
                isLink
              />
            )}
          </CardContent>
        </Card>

        {/* Interview Timeline & Notes */}
        <div className="lg:col-span-2 space-y-6">
          <InterviewTimeline applicationId={id!} />
          <FollowUpSection applicationId={id!} />
          <NotesSection applicationId={id!} />
        </div>
      </div>

      {editOpen && (
        <EditApplicationModal
          application={application}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
  isLink,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  isLink?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:underline truncate block"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm truncate">{value}</p>
        )}
      </div>
    </div>
  )
}
