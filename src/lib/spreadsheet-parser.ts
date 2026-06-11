import * as XLSX from 'xlsx'

export interface ParsedSpreadsheet {
  headers: string[]
  rows: Record<string, string>[]
  totalRows: number
}

/**
 * Parse an Excel or CSV file into headers and row objects.
 * Strings only — we coerce everything to string for safety, since users
 * map columns later and we want consistent input shapes.
 */
export async function parseSpreadsheet(file: File): Promise<ParsedSpreadsheet> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })

  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) {
    throw new Error('The file appears to be empty.')
  }

  const sheet = workbook.Sheets[firstSheetName]

  // Convert to array-of-arrays so we can extract headers explicitly
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
    raw: false, // keeps dates as formatted strings
  })

  if (rows.length === 0) {
    throw new Error('No data found in the spreadsheet.')
  }

  const rawHeaders = (rows[0] as unknown[]).map((cell, idx) => {
    const value = String(cell ?? '').trim()
    return value || `Column ${idx + 1}`
  })

  // Deduplicate header names (in case of "Notes" appearing twice)
  const headers: string[] = []
  const seen = new Map<string, number>()
  for (const header of rawHeaders) {
    const count = seen.get(header) ?? 0
    seen.set(header, count + 1)
    headers.push(count === 0 ? header : `${header} (${count + 1})`)
  }

  const dataRows = rows.slice(1)
  const parsedRows: Record<string, string>[] = []

  for (const row of dataRows) {
    const rowArray = row as unknown[]
    // Skip completely empty rows
    if (rowArray.every((cell) => String(cell ?? '').trim() === '')) {
      continue
    }

    const obj: Record<string, string> = {}
    headers.forEach((header, idx) => {
      const value = rowArray[idx]
      obj[header] = value === undefined || value === null ? '' : String(value).trim()
    })
    parsedRows.push(obj)
  }

  return {
    headers,
    rows: parsedRows,
    totalRows: parsedRows.length,
  }
}

export const ACCEPTED_FILE_TYPES = '.xlsx,.xls,.csv'
export const MAX_FILE_SIZE_MB = 10
