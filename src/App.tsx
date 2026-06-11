import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth-store'
import { useThemeStore } from '@/store/theme-store'
import { AppLayout } from '@/components/layout/app-layout'
import { PageLoader } from '@/components/ui/spinner'
import { PwaPrompt } from '@/components/features/pwa-prompt'

// Route-level code splitting: each page (and its heavy deps) loads on demand.
// - dashboard pulls in recharts
// - import page pulls in xlsx (~400KB)
const LoginPage = lazy(() => import('@/pages/auth/login').then((m) => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import('@/pages/auth/signup').then((m) => ({ default: m.SignupPage })))
const ForgotPasswordPage = lazy(() =>
  import('@/pages/auth/forgot-password').then((m) => ({ default: m.ForgotPasswordPage }))
)
const DashboardPage = lazy(() =>
  import('@/pages/dashboard').then((m) => ({ default: m.DashboardPage }))
)
const ApplicationsListPage = lazy(() =>
  import('@/pages/applications/applications-list').then((m) => ({ default: m.ApplicationsListPage }))
)
const ApplicationDetailPage = lazy(() =>
  import('@/pages/applications/application-detail').then((m) => ({ default: m.ApplicationDetailPage }))
)
const FollowUpsPage = lazy(() =>
  import('@/pages/follow-ups').then((m) => ({ default: m.FollowUpsPage }))
)
const CalendarPage = lazy(() =>
  import('@/pages/calendar').then((m) => ({ default: m.CalendarPage }))
)
const SettingsPage = lazy(() =>
  import('@/pages/settings').then((m) => ({ default: m.SettingsPage }))
)
const ImportApplicationsPage = lazy(() =>
  import('@/pages/import-applications').then((m) => ({ default: m.ImportApplicationsPage }))
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore()

  if (isLoading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}

function GuestGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore()

  if (isLoading) return <PageLoader />
  if (user) return <Navigate to="/" replace />

  return <>{children}</>
}

function AppRoutes() {
  const { initialize } = useAuthStore()
  const initializeTheme = useThemeStore((s) => s.initialize)

  useEffect(() => {
    initialize()
    initializeTheme()
  }, [initialize, initializeTheme])

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<GuestGuard><LoginPage /></GuestGuard>} />
        <Route path="/signup" element={<GuestGuard><SignupPage /></GuestGuard>} />
        <Route path="/forgot-password" element={<GuestGuard><ForgotPasswordPage /></GuestGuard>} />

        {/* Protected routes */}
        <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/applications" element={<ApplicationsListPage />} />
          <Route path="/applications/import" element={<ImportApplicationsPage />} />
          <Route path="/applications/:id" element={<ApplicationDetailPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/follow-ups" element={<FollowUpsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <PwaPrompt />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
