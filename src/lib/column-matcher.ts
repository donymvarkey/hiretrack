import type { ApplicationStatus } from '@/types'

export type ImportField =
  | 'company_name'
  | 'contact_number'
  | 'hr_name'
  | 'job_role'
  | 'company_website'
  | 'linkedin_profile'
  | 'email_address'
  | 'job_location'
  | 'salary_offered'
  | 'status'
  | 'notes'
  | 'skip'

export interface FieldDefinition {
  value: ImportField
  label: string
  required: boolean
  synonyms: string[]
}

export const FIELD_DEFINITIONS: FieldDefinition[] = [
  {
    value: 'company_name',
    label: 'Company Name',
    required: true,
    synonyms: ['company', 'companyname', 'organization', 'org', 'employer', 'firm', 'business', 'co'],
  },
  {
    value: 'contact_number',
    label: 'Contact Number',
    required: true,
    synonyms: ['contact', 'contactnumber', 'phone', 'phonenumber', 'mobile', 'mobilenumber', 'cell', 'cellphone', 'telephone', 'tel'],
  },
  {
    value: 'hr_name',
    label: 'HR / Recruiter Name',
    required: false,
    synonyms: ['hr', 'hrname', 'recruiter', 'recruitername', 'contactperson', 'contact', 'pointofcontact', 'poc', 'recruitingcoordinator'],
  },
  {
    value: 'job_role',
    label: 'Job Role',
    required: false,
    synonyms: ['role', 'position', 'jobtitle', 'title', 'job', 'designation', 'opening', 'jobposition'],
  },
  {
    value: 'company_website',
    label: 'Company Website',
    required: false,
    synonyms: ['website', 'companywebsite', 'url', 'companyurl', 'site', 'homepage', 'web'],
  },
  {
    value: 'linkedin_profile',
    label: 'LinkedIn Profile',
    required: false,
    synonyms: ['linkedin', 'linkedinurl', 'linkedinprofile', 'linkedinlink', 'profile'],
  },
  {
    value: 'email_address',
    label: 'Email Address',
    required: false,
    synonyms: ['email', 'emailaddress', 'mail', 'emailid', 'mailid', 'contactemail'],
  },
  {
    value: 'job_location',
    label: 'Job Location',
    required: false,
    synonyms: ['location', 'city', 'place', 'where', 'office', 'joblocation', 'workplace', 'address'],
  },
  {
    value: 'salary_offered',
    label: 'Salary Offered',
    required: false,
    synonyms: ['salary', 'salaryoffered', 'pay', 'compensation', 'package', 'ctc', 'remuneration', 'wage'],
  },
  {
    value: 'status',
    label: 'Status',
    required: false,
    synonyms: ['status', 'stage', 'phase', 'progress', 'state', 'applicationstatus'],
  },
  {
    value: 'notes',
    label: 'Notes',
    required: false,
    synonyms: ['notes', 'note', 'comments', 'comment', 'remarks', 'description', 'details', 'mycomments'],
  },
]

const SKIP_FIELD: FieldDefinition = {
  value: 'skip',
  label: "Don't import",
  required: false,
  synonyms: [],
}

export const ALL_FIELDS: FieldDefinition[] = [...FIELD_DEFINITIONS, SKIP_FIELD]

export const REQUIRED_FIELDS = FIELD_DEFINITIONS.filter((f) => f.required).map((f) => f.value)

/**
 * Normalize a string for comparison: lowercase, strip whitespace, punctuation.
 */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\s_\-./]+/g, '')
    .replace(/[^a-z0-9]/g, '')
}

/**
 * Compute Levenshtein distance — used as a fallback when no synonym matches.
 */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const matrix: number[][] = []
  for (let i = 0; i <= b.length; i++) matrix[i] = [i]
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

/**
 * Suggest the best matching field for a given spreadsheet header.
 * Returns 'skip' if confidence is too low.
 */
export function suggestField(header: string): ImportField {
  const normalized = normalize(header)
  if (!normalized) return 'skip'

  let bestMatch: { field: ImportField; score: number } | null = null

  for (const field of FIELD_DEFINITIONS) {
    // Exact match against field name
    if (normalize(field.value) === normalized || normalize(field.label) === normalized) {
      return field.value
    }

    // Synonym match
    for (const synonym of field.synonyms) {
      const normSyn = normalize(synonym)
      if (normSyn === normalized) {
        return field.value
      }
      // Substring match (e.g., "phonenumber" contains "phone")
      if (normalized.includes(normSyn) || normSyn.includes(normalized)) {
        const overlap = Math.min(normSyn.length, normalized.length) /
                        Math.max(normSyn.length, normalized.length)
        if (overlap >= 0.6) {
          if (!bestMatch || overlap > bestMatch.score) {
            bestMatch = { field: field.value, score: overlap }
          }
        }
      }
    }

    // Fuzzy match against label and synonyms
    const candidates = [normalize(field.label), ...field.synonyms.map(normalize)]
    for (const candidate of candidates) {
      if (!candidate) continue
      const distance = levenshtein(normalized, candidate)
      const maxLen = Math.max(normalized.length, candidate.length)
      const similarity = 1 - distance / maxLen
      if (similarity >= 0.85) {
        if (!bestMatch || similarity > bestMatch.score) {
          bestMatch = { field: field.value, score: similarity }
        }
      }
    }
  }

  return bestMatch?.field ?? 'skip'
}

/**
 * Generate the initial mapping for all headers, ensuring no duplicates.
 * If two headers map to the same field, only the first wins; the rest become 'skip'.
 */
export function suggestMapping(headers: string[]): Record<string, ImportField> {
  const mapping: Record<string, ImportField> = {}
  const usedFields = new Set<ImportField>()

  for (const header of headers) {
    const suggested = suggestField(header)
    if (suggested !== 'skip' && !usedFields.has(suggested)) {
      mapping[header] = suggested
      usedFields.add(suggested)
    } else {
      mapping[header] = 'skip'
    }
  }

  return mapping
}

/**
 * Normalize a free-text status value to one of our enum values.
 * Returns null if no match found (caller can default it).
 */
export function normalizeStatus(raw: string): ApplicationStatus | null {
  const normalized = normalize(raw)
  if (!normalized) return null

  const statusMap: Record<string, ApplicationStatus> = {
    hrcalled: 'hr_called',
    hrcall: 'hr_called',
    called: 'hr_called',
    applied: 'applied',
    submit: 'applied',
    submitted: 'applied',
    appsent: 'applied',
    applicationsent: 'applied',
    resumeshared: 'resume_shared',
    resumesent: 'resume_shared',
    cvshared: 'resume_shared',
    cvsent: 'resume_shared',
    screening: 'screening_round',
    screeninground: 'screening_round',
    initialscreening: 'screening_round',
    technical1: 'technical_round_1',
    technicalround1: 'technical_round_1',
    tech1: 'technical_round_1',
    technical: 'technical_round_1',
    techround1: 'technical_round_1',
    technical2: 'technical_round_2',
    technicalround2: 'technical_round_2',
    tech2: 'technical_round_2',
    techround2: 'technical_round_2',
    assignment: 'assignment_given',
    assignmentgiven: 'assignment_given',
    takehome: 'assignment_given',
    homework: 'assignment_given',
    managerial: 'managerial_round',
    managerialround: 'managerial_round',
    managerround: 'managerial_round',
    manager: 'managerial_round',
    hrround: 'hr_round',
    finalround: 'hr_round',
    offer: 'offer_received',
    offerreceived: 'offer_received',
    offered: 'offer_received',
    rejected: 'rejected',
    reject: 'rejected',
    declined: 'rejected',
    notselected: 'rejected',
    joined: 'joined',
    joining: 'joined',
    accepted: 'joined',
    onhold: 'on_hold',
    hold: 'on_hold',
    paused: 'on_hold',
    pending: 'on_hold',
  }

  return statusMap[normalized] ?? null
}
