import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth-store'
import { AppLayout } from '@/components/layout/app-layout'
import { LoginPage } from '@/pages/auth/login'
import { SignupPage } from '@/pages/auth/signup'
import { ForgotPasswordPage } from '@/pages/auth/forgot-password'
import { DashboardPage } from '@/pages/dashboard'
import { ApplicationsListPage } from '@/pages/applications/applications-list'
import { ApplicationDetailPage } from '@/pages/applications/application-detail'
import { FollowUpsPage } from '@/pages/follow-ups'
import { SettingsPage } from '@/pages/settings'
import { PageLoader } from '@/components/ui/spinner'

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

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<GuestGuard><LoginPage /></GuestGuard>} />
      <Route path="/signup" element={<GuestGuard><SignupPage /></GuestGuard>} />
      <Route path="/forgot-password" element={<GuestGuard><ForgotPasswordPage /></GuestGuard>} />

      {/* Protected routes */}
      <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/applications" element={<ApplicationsListPage />} />
        <Route path="/applications/:id" element={<ApplicationDetailPage />} />
        <Route path="/follow-ups" element={<FollowUpsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
