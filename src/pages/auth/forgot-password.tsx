import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { AuthLayout } from '@/components/layout/auth-layout'
import { useAuthStore } from '@/store/auth-store'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations'

export function ForgotPasswordPage() {
  const { resetPassword } = useAuthStore()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null)
    setIsLoading(true)
    try {
      await resetPassword(data.email)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle={
        success
          ? 'Check your email for a reset link'
          : 'Enter your email to receive a password reset link'
      }
    >
      {!success ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          {error && <p className="text-center text-xs text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Spinner size="sm" className="text-white" /> : 'Send Reset Link'}
          </Button>
        </form>
      ) : (
        <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          If an account exists with that email, you&apos;ll receive a password reset link shortly.
        </div>
      )}

      <Link
        to="/login"
        className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to login
      </Link>
    </AuthLayout>
  )
}
