import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Seo } from '@/components/seo'
import { useAuthStore } from '@/store/auth-store'
import { signupSchema, type SignupFormData } from '@/lib/validations'

export function SignupPage() {
  const { signUp } = useAuthStore()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    setError(null)
    setIsLoading(true)
    try {
      await signUp(data.email, data.password)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <AuthLayout title="Check your email" subtitle="One more step to get started">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
            <MailCheck className="h-6 w-6" />
          </div>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent you a confirmation link. Please check your email to verify your account.
          </p>
          <Link to="/login" className="w-full">
            <Button variant="outline" className="w-full">
              Back to Login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Create an account" subtitle="Start tracking your job applications">
      <Seo
        title="Create Account"
        description="Create a free HireTrack account to organize your job search in one place."
        path="/signup"
      />
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

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register('password')}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {error && <p className="text-center text-xs text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Spinner size="sm" className="text-white" /> : 'Create Account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
