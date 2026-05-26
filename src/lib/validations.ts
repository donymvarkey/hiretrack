import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
})

export const quickAddSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  contact_number: z.string().min(1, 'Contact number is required'),
  hr_name: z.string().optional(),
  notes: z.string().optional(),
})

export const applicationSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  contact_number: z.string().min(1, 'Contact number is required'),
  hr_name: z.string().optional(),
  job_role: z.string().optional(),
  company_website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  linkedin_profile: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  email_address: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  job_location: z.string().optional(),
  salary_offered: z.string().optional(),
  status: z.enum([
    'hr_called', 'applied', 'resume_shared', 'screening_round',
    'technical_round_1', 'technical_round_2', 'assignment_given',
    'managerial_round', 'hr_round', 'offer_received', 'rejected',
    'joined', 'on_hold',
  ]).default('hr_called'),
  notes: z.string().optional(),
})

export const interviewRoundSchema = z.object({
  round_type: z.string().min(1, 'Round type is required'),
  scheduled_at: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
})

export const followUpSchema = z.object({
  follow_up_date: z.string().min(1, 'Follow-up date is required'),
  type: z.enum(['callback', 'interview', 'email', 'general']).default('general'),
  description: z.string().optional(),
})

export const noteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type QuickAddFormData = z.infer<typeof quickAddSchema>
export type ApplicationFormData = z.infer<typeof applicationSchema>
export type InterviewRoundFormData = z.infer<typeof interviewRoundSchema>
export type FollowUpFormData = z.infer<typeof followUpSchema>
export type NoteFormData = z.infer<typeof noteSchema>
