import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Briefcase,
  TrendingUp,
  Trophy,
  XCircle,
  Calendar,
  Bell,
  ArrowRight,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/spinner'
import { getDashboardStats } from '@/services/activity-logs'
import { getApplications } from '@/services/applications'
import { getPendingFollowUps, type FollowUpWithApplication } from '@/services/follow-ups'
import { APPLICATION_STATUSES, type Application } from '@/types'
import { formatDate, formatRelativeDate } from '@/lib/utils'
import { Link } from 'react-router-dom'

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

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

  const monthlyData = useMemo(() => buildMonthlyActivity(applications ?? []), [applications])
  const statusData = useMemo(() => buildStatusDistribution(applications ?? []), [applications])

  if (statsLoading || appsLoading || followUpsLoading) {
    return <PageLoader />
  }

  const recentApplications = applications?.slice(0, 5) ?? []
  const pendingFollowUps = followUps?.slice(0, 5) ?? []

  const statCards = [
    {
      label: 'Total Applications',
      value: stats?.total ?? 0,
      icon: Briefcase,
      tile: 'bg-primary/10 text-primary',
    },
    {
      label: 'Active Processes',
      value: stats?.active ?? 0,
      icon: TrendingUp,
      tile: 'bg-info/10 text-info',
    },
    {
      label: 'Offers Received',
      value: stats?.offers ?? 0,
      icon: Trophy,
      tile: 'bg-success/10 text-success',
    },
    {
      label: 'Rejections',
      value: stats?.rejections ?? 0,
      icon: XCircle,
      tile: 'bg-destructive/10 text-destructive',
    },
  ]

  const hasData = (applications?.length ?? 0) > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your job search progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight">{stat.value}</p>
                </div>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.tile}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Application Activity</CardTitle>
            <p className="text-xs text-muted-foreground">Applications added over the last 6 months</p>
          </CardHeader>
          <CardContent className="pt-2">
            {hasData ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border)' }} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                      fill="url(#activityFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart message="No application data yet" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Status Breakdown</CardTitle>
            <p className="text-xs text-muted-foreground">Where your applications stand</p>
          </CardHeader>
          <CardContent className="pt-2">
            {hasData ? (
              <>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={48}
                        outerRadius={72}
                        paddingAngle={2}
                        strokeWidth={0}
                      >
                        {statusData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 space-y-1.5">
                  {statusData.map((entry, i) => (
                    <div key={entry.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                        {entry.name}
                      </span>
                      <span className="font-medium">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyChart message="No application data yet" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Applications</CardTitle>
              <Link
                to="/applications"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No applications yet. Add your first one!
              </p>
            ) : (
              <div className="space-y-1">
                {recentApplications.map((app) => {
                  const statusInfo = APPLICATION_STATUSES[app.status]
                  return (
                    <Link
                      key={app.id}
                      to={`/applications/${app.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg p-2.5 transition-colors hover:bg-accent"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold uppercase text-muted-foreground">
                          {app.company_name.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{app.company_name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {app.job_role || 'No role specified'} · {formatRelativeDate(app.created_at)}
                          </p>
                        </div>
                      </div>
                      <Badge className={statusInfo?.color}>{statusInfo?.label}</Badge>
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
              <Link
                to="/follow-ups"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {pendingFollowUps.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No pending follow-ups</p>
            ) : (
              <div className="space-y-1">
                {pendingFollowUps.map((followUp: FollowUpWithApplication) => {
                  const isOverdue = new Date(followUp.follow_up_date) < new Date()
                  return (
                    <div
                      key={followUp.id}
                      className="flex items-center justify-between gap-3 rounded-lg p-2.5 transition-colors hover:bg-accent"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            isOverdue ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isOverdue ? <Bell className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {followUp.applications?.company_name ?? 'Unknown'}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {followUp.description || followUp.type}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 text-xs font-medium ${
                          isOverdue ? 'text-destructive' : 'text-muted-foreground'
                        }`}
                      >
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

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  )
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ name?: string; value?: number; payload?: { month?: string; name?: string } }>
}

function ChartTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const item = payload[0]
  const label = item.payload?.month ?? item.payload?.name ?? item.name
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-popover-foreground">{label}</p>
      <p className="text-muted-foreground">{item.value} application(s)</p>
    </div>
  )
}

function buildMonthlyActivity(applications: Application[]) {
  const months: { key: string; month: string; count: number }[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      count: 0,
    })
  }
  const index = new Map(months.map((m) => [m.key, m]))
  for (const app of applications) {
    const d = new Date(app.created_at)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const bucket = index.get(key)
    if (bucket) bucket.count += 1
  }
  return months.map(({ month, count }) => ({ month, count }))
}

function buildStatusDistribution(applications: Application[]) {
  const counts = new Map<string, number>()
  for (const app of applications) {
    counts.set(app.status, (counts.get(app.status) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([status, value]) => ({
      name: APPLICATION_STATUSES[status]?.label ?? status,
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
}
