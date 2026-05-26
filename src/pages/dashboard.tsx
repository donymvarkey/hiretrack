import { useQuery } from '@tanstack/react-query'
import {
  Briefcase,
  TrendingUp,
  Trophy,
  XCircle,
  Calendar,
  Bell,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/spinner'
import { getDashboardStats } from '@/services/activity-logs'
import { getApplications } from '@/services/applications'
import { getPendingFollowUps } from '@/services/follow-ups'
import { APPLICATION_STATUSES } from '@/types'
import { formatDate, formatRelativeDate } from '@/lib/utils'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  })

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
  })

  const { data: followUps, isLoading: followUpsLoading } = useQuery({
    queryKey: ['pending-follow-ups'],
    queryFn: getPendingFollowUps,
  })

  if (statsLoading || appsLoading || followUpsLoading) {
    return <PageLoader />
  }

  const recentApplications = applications?.slice(0, 5) ?? []
  const pendingFollowUps = followUps?.slice(0, 5) ?? []

  const statCards = [
    { label: 'Total Applications', value: stats?.total ?? 0, icon: Briefcase, color: 'text-blue-400' },
    { label: 'Active Processes', value: stats?.active ?? 0, icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Offers Received', value: stats?.offers ?? 0, icon: Trophy, color: 'text-amber-400' },
    { label: 'Rejections', value: stats?.rejections ?? 0, icon: XCircle, color: 'text-red-400' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your job search progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Applications</CardTitle>
              <Link to="/applications" className="text-xs text-muted-foreground hover:text-foreground">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No applications yet. Add your first one!
              </p>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app) => {
                  const statusInfo = APPLICATION_STATUSES[app.status]
                  return (
                    <Link
                      key={app.id}
                      to={`/applications/${app.id}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{app.company_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {app.job_role || 'No role specified'} · {formatRelativeDate(app.created_at)}
                        </p>
                      </div>
                      <Badge className={statusInfo?.color}>
                        {statusInfo?.label}
                      </Badge>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Follow-ups */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Pending Follow-ups</CardTitle>
              <Link to="/follow-ups" className="text-xs text-muted-foreground hover:text-foreground">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {pendingFollowUps.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No pending follow-ups
              </p>
            ) : (
              <div className="space-y-3">
                {pendingFollowUps.map((followUp) => {
                  const app = (followUp as Record<string, unknown>).applications as { company_name: string; job_role: string | null } | null
                  const isOverdue = new Date(followUp.follow_up_date) < new Date()
                  return (
                    <div
                      key={followUp.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {isOverdue ? (
                          <Bell className="h-4 w-4 text-red-400 shrink-0" />
                        ) : (
                          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {app?.company_name ?? 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {followUp.description || followUp.type}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs shrink-0 ${isOverdue ? 'text-red-400' : 'text-muted-foreground'}`}>
                        {formatDate(followUp.follow_up_date)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
