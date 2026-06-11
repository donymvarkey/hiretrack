import { supabase } from '@/lib/supabase'
import { normalizeStatus, type ImportField } from '@/lib/column-matcher'
import type { ApplicationInsert, ApplicationStatus } from '@/types'

export interface RowValidationError {
  rowIndex: number
  reason: string
  rowData: Record<string, string>
}

export type DuplicateStrategy = 'skip' | 'import_anyway'

export interface PreparedRow {
  rowIndex: number
  application: ApplicationInsert
  rawData: Record<string, string>
}

/**
 * Apply the column mapping to raw rows, validate, and return ready-to-insert
 * applications along with a list of rows that fail validation.
 */
export function prepareRowsForImport(
  rows: Record<string, string>[],
  mapping: Record<string, ImportField>
): { prepared: PreparedRow[]; errors: RowValidationError[] } {
  const prepared: PreparedRow[] = []
  const errors: RowValidationError[] = []

  // Reverse the mapping: field → header
  const fieldToHeader: Partial<Record<ImportField, string>> = {}
  for (const [header, field] of Object.entries(mapping)) {
    if (field !== 'skip' && !fieldToHeader[field]) {
      fieldToHeader[field] = header
    }
  }

  rows.forEach((row, idx) => {
    const get = (field: ImportField): string => {
      const header = fieldToHeader[field]
      if (!header) return ''
      return (row[header] ?? '').trim()
    }

    const companyName = get('company_name')
    const contactNumber = get('contact_number')

    if (!companyName) {
      errors.push({
        rowIndex: idx,
        reason: 'Missing company name',
        rowData: row,
      })
      return
    }

    if (!contactNumber) {
      errors.push({
        rowIndex: idx,
        reason: 'Missing contact number',
        rowData: row,
      })
      return
    }

    const rawStatus = get('status')
    let status: ApplicationStatus = 'applied'
    if (rawStatus) {
      const normalized = normalizeStatus(rawStatus)
      if (normalized) status = normalized
    }

    const application: ApplicationInsert = {
      company_name: companyName,
      contact_number: contactNumber,
      hr_name: get('hr_name') || null,
      job_role: get('job_role') || null,
      company_website: get('company_website') || null,
      linkedin_profile: get('linkedin_profile') || null,
      email_address: get('email_address') || null,
      job_location: get('job_location') || null,
      salary_offered: get('salary_offered') || null,
      notes: get('notes') || null,
      status,
    }

    prepared.push({ rowIndex: idx, application, rawData: row })
  })

  return { prepared, errors }
}

/**
 * Detect duplicates against existing applications in the database.
 * A duplicate is defined as same company_name + contact_number (case-insensitive).
 */
export async function detectDuplicates(rows: PreparedRow[]): Promise<{
  unique: PreparedRow[]
  duplicates: PreparedRow[]
}> {
  if (rows.length === 0) return { unique: [], duplicates: [] }

  const { data, error } = await supabase
    .from('applications')
    .select('company_name, contact_number')

  if (error) throw error

  const existingKeys = new Set(
    ((data ?? []) as { company_name: string; contact_number: string }[]).map(
      (a) => `${a.company_name.toLowerCase()}|${a.contact_number.toLowerCase()}`
    )
  )

  const unique: PreparedRow[] = []
  const duplicates: PreparedRow[] = []
  const inBatchKeys = new Set<string>()

  for (const row of rows) {
    const key = `${row.application.company_name.toLowerCase()}|${row.application.contact_number.toLowerCase()}`
    if (existingKeys.has(key) || inBatchKeys.has(key)) {
      duplicates.push(row)
    } else {
      unique.push(row)
      inBatchKeys.add(key)
    }
  }

  return { unique, duplicates }
}

export interface ImportResult {
  successCount: number
  failureCount: number
  failures: { rowIndex: number; reason: string }[]
}

/**
 * Insert applications in batches. Uses Promise.allSettled so a single
 * failure doesn't abort the rest.
 */
export async function importApplications(rows: PreparedRow[]): Promise<ImportResult> {
  if (rows.length === 0) {
    return { successCount: 0, failureCount: 0, failures: [] }
  }

  const BATCH_SIZE = 50
  let successCount = 0
  const failures: { rowIndex: number; reason: string }[] = []

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)
    const inserts = batch.map((r) => r.application)

    const { data, error } = await supabase
      .from('applications')
      .insert(inserts as never)
      .select('id')

    if (error) {
      // Whole batch failed — fall back to per-row inserts to capture which ones errored
      for (const row of batch) {
        const { error: rowError } = await supabase
          .from('applications')
          .insert(row.application as never)

        if (rowError) {
          failures.push({
            rowIndex: row.rowIndex,
            reason: rowError.message,
          })
        } else {
          successCount++
        }
      }
    } else {
      successCount += (data ?? []).length
    }
  }

  return {
    successCount,
    failureCount: failures.length,
    failures,
  }
}
