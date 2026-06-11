import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Search, Briefcase, Filter, Upload, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PageLoader } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { getApplications } from '@/services/applications'
import { APPLICATION_STATUSES, type ApplicationStatus } from '@/types'
import { formatRelativeDate } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'

export function ApplicationsListPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { setQuickAddOpen } = useAppStore()

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
  })

  if (isLoading) return <PageLoader />

  const filtered = (applications ?? []).filter((app) => {
    const matchesSearch =
      !search ||
      app.company_name.toLowerCase().includes(search.toLowerCase()) ||
      app.hr_name?.toLowerCase().includes(search.toLowerCase()) ||
      app.job_role?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-sm text-muted-foreground">
            {applications?.length ?? 0} total applications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/applications/import">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Import</span>
            </Button>
          </Link>
          <Button onClick={() => setQuickAddOpen(true)} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add New</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company, role, or recruiter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-48"
          >
            <option value="all">All Statuses</option>
            {Object.entries(APPLICATION_STATUSES).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Applications List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No applications found"
          description={
            search || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start tracking your job applications by adding your first one'
          }
          action={
            !search && statusFilter === 'all' ? (
              <Button onClick={() => setQuickAddOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Application
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3">
          {filtered.map((app) => {
            const statusInfo = APPLICATION_STATUSES[app.status as ApplicationStatus]
            return (
              <Link key={app.id} to={`/applications/${app.id}`}>
                <Card className="group transition-all hover:border-primary/40 hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-sm font-bold uppercase text-white shadow-sm">
                        {app.company_name.slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-semibold">{app.company_name}</h3>
                          <Badge className={statusInfo?.color}>{statusInfo?.label}</Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {app.job_role && <span>{app.job_role}</span>}
                          {app.hr_name && <span>· HR: {app.hr_name}</span>}
                          {app.job_location && <span>· {app.job_location}</span>}
                          {app.salary_offered && <span>· ₹{app.salary_offered}</span>}
                        </div>
                      </div>
                      <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                        {formatRelativeDate(app.created_at)}
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
