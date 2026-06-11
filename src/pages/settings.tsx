import { useState } from 'react'
import { User, Mail, Shield, Sun, Moon, Monitor, Palette, KeyRound, Download, Smartphone, LogOut, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/auth-store'
import { useThemeStore, type Theme } from '@/store/theme-store'
import { usePwaInstallStore } from '@/store/pwa-install-store'
import { supabase } from '@/lib/supabase'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export function SettingsPage() {
  const { user, signOut } = useAuthStore()
  const { theme, setTheme } = useThemeStore()
  const { canInstall, installed, dismissed, promptInstall, dismiss } = usePwaInstallStore()
  const [newPassword, setNewPassword] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const showInstall = canInstall && !installed && !dismissed

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    setIsUpdating(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setMessage({ type: 'success', text: 'Password updated successfully' })
      setNewPassword('')
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update password' })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Install app (one-time) */}
      {showInstall && (
        <Card className="overflow-hidden border-primary/30">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Install HireTrack</p>
              <p className="text-xs text-muted-foreground">
                Add it to your home screen for a faster, full-screen, offline-ready experience.
              </p>
            </div>
            <Button size="sm" onClick={promptInstall} className="shrink-0 gap-1.5">
              <Download className="h-4 w-4" />
              Install
            </Button>
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>
      )}

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4 text-primary" />
            Appearance
          </CardTitle>
          <CardDescription>Choose how HireTrack looks to you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((option) => {
              const active = theme === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all cursor-pointer',
                    active
                      ? 'border-primary bg-accent text-accent-foreground ring-2 ring-ring/30'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  )}
                >
                  <option.icon className="h-5 w-5" />
                  {option.label}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-primary" />
            Profile
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Account created</p>
              <p className="text-sm font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4 text-primary" />
            Change Password
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            {message && (
              <p className={cn('text-xs', message.type === 'success' ? 'text-success' : 'text-destructive')}>
                {message.text}
              </p>
            )}

            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? <Spinner size="sm" className="text-white" /> : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Sign out */}
      <Button
        variant="outline"
        onClick={signOut}
        className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  )
}
