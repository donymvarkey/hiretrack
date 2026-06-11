import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  Upload,
  FileSpreadsheet,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  FileWarning,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import {
  parseSpreadsheet,
  ACCEPTED_FILE_TYPES,
  MAX_FILE_SIZE_MB,
  type ParsedSpreadsheet,
} from '@/lib/spreadsheet-parser'
import {
  ALL_FIELDS,
  FIELD_DEFINITIONS,
  REQUIRED_FIELDS,
  suggestMapping,
  type ImportField,
} from '@/lib/column-matcher'
import {
  prepareRowsForImport,
  detectDuplicates,
  importApplications,
  type PreparedRow,
  type RowValidationError,
  type ImportResult,
} from '@/services/import'

type Step = 'upload' | 'map' | 'review' | 'result'

export function ImportApplicationsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [parsed, setParsed] = useState<ParsedSpreadsheet | null>(null)
  const [mapping, setMapping] = useState<Record<string, ImportField>>({})
  const [parseError, setParseError] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)

  const [validRows, setValidRows] = useState<PreparedRow[]>([])
  const [invalidRows, setInvalidRows] = useState<RowValidationError[]>([])
  const [duplicateRows, setDuplicateRows] = useState<PreparedRow[]>([])
  const [importDuplicates, setImportDuplicates] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)

  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  // ─── Step 1: Upload ───────────────────────────────────────
  const handleFileSelect = async (selectedFile: File) => {
    setParseError(null)

    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setParseError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`)
      return
    }

    setFile(selectedFile)
    setIsParsing(true)

    try {
      const result = await parseSpreadsheet(selectedFile)
      if (result.totalRows === 0) {
        setParseError('No rows found in the spreadsheet.')
        setFile(null)
        return
      }
      setParsed(result)
      setMapping(suggestMapping(result.headers))
      setStep('map')
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Failed to parse the file.')
      setFile(null)
    } finally {
      setIsParsing(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) handleFileSelect(droppedFile)
  }

  // ─── Step 2: Map columns ──────────────────────────────────
  const updateMapping = (header: string, field: ImportField) => {
    setMapping((prev) => {
      const next = { ...prev, [header]: field }
      // If user selects a non-skip field that's already mapped elsewhere, unmap the other
      if (field !== 'skip') {
        for (const [otherHeader, otherField] of Object.entries(prev)) {
          if (otherHeader !== header && otherField === field) {
            next[otherHeader] = 'skip'
          }
        }
      }
      return next
    })
  }

  const mappedFields = new Set<ImportField>(Object.values(mapping).filter((f) => f !== 'skip'))
  const missingRequired = REQUIRED_FIELDS.filter((f) => !mappedFields.has(f))
  const canProceedToReview = missingRequired.length === 0

  const handleReview = async () => {
    if (!parsed) return
    setIsReviewing(true)
    try {
      const { prepared, errors } = prepareRowsForImport(parsed.rows, mapping)
      const { unique, duplicates } = await detectDuplicates(prepared)
      setValidRows(unique)
      setDuplicateRows(duplicates)
      setInvalidRows(errors)
      setStep('review')
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Failed to validate rows.')
    } finally {
      setIsReviewing(false)
    }
  }

  // ─── Step 3: Review & import ──────────────────────────────
  const handleImport = async () => {
    setIsImporting(true)
    try {
      const rowsToImport = importDuplicates ? [...validRows, ...duplicateRows] : validRows
      const result = await importApplications(rowsToImport)
      setImportResult(result)
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      setStep('result')
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Import failed.')
    } finally {
      setIsImporting(false)
    }
  }

  // ─── Reset ────────────────────────────────────────────────
  const handleReset = () => {
    setStep('upload')
    setFile(null)
    setParsed(null)
    setMapping({})
    setParseError(null)
    setValidRows([])
    setInvalidRows([])
    setDuplicateRows([])
    setImportDuplicates(false)
    setImportResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/applications')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Import from Spreadsheet</h1>
          <p className="text-sm text-muted-foreground">
            Upload an Excel or CSV file and map your columns to HireTrack fields
          </p>
        </div>
      </div>

      {/* Steps indicator */}
      <StepIndicator currentStep={step} />

      {/* ─── STEP 1: UPLOAD ─── */}
      {step === 'upload' && (
        <Card>
          <CardContent className="p-8">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleFileSelect(f)
                }}
              />

              {isParsing ? (
                <div className="flex flex-col items-center gap-3">
                  <Spinner size="lg" />
                  <p className="text-sm text-muted-foreground">Parsing your file...</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-primary/10 p-4">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium mb-1">
                    Drop your spreadsheet here
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse — supports .xlsx, .xls, .csv up to {MAX_FILE_SIZE_MB}MB
                  </p>
                  <Button variant="outline">Choose File</Button>
                </>
              )}
            </div>

            {parseError && (
              <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {parseError}
              </div>
            )}

            <div className="mt-6 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Tips for best results:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>The first row should contain column headers</li>
                <li>Required fields: Company Name and Contact Number</li>
                <li>HireTrack will try to auto-detect your columns — you can adjust them next</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── STEP 2: MAPPING ─── */}
      {step === 'map' && parsed && (
        <>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  {file?.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {parsed.totalRows} rows, {parsed.headers.length} columns
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <X className="h-4 w-4 mr-1" />
                Change file
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center pb-2 border-b text-xs font-medium text-muted-foreground">
                  <div>Your column</div>
                  <div className="w-4" />
                  <div>Maps to</div>
                </div>

                {parsed.headers.map((header) => {
                  const sampleValues = parsed.rows
                    .slice(0, 3)
                    .map((r) => r[header])
                    .filter(Boolean)
                    .slice(0, 2)

                  return (
                    <div
                      key={header}
                      className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{header}</p>
                        {sampleValues.length > 0 && (
                          <p className="text-xs text-muted-foreground truncate">
                            e.g., {sampleValues.join(', ')}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground mt-2" />
                      <Select
                        value={mapping[header] ?? 'skip'}
                        onChange={(e) => updateMapping(header, e.target.value as ImportField)}
                      >
                        {ALL_FIELDS.map((field) => (
                          <option key={field.value} value={field.value}>
                            {field.label}
                            {field.required ? ' *' : ''}
                          </option>
                        ))}
                      </Select>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {missingRequired.length > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4 flex items-start gap-3">
                <FileWarning className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-400">Required fields missing</p>
                  <p className="text-muted-foreground mt-0.5">
                    Please map a column to:{' '}
                    {missingRequired
                      .map(
                        (f) =>
                          FIELD_DEFINITIONS.find((fd) => fd.value === f)?.label ?? f
                      )
                      .join(', ')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset}>
              Cancel
            </Button>
            <Button
              onClick={handleReview}
              disabled={!canProceedToReview || isReviewing}
            >
              {isReviewing ? <Spinner size="sm" /> : 'Continue to Review'}
            </Button>
          </div>
        </>
      )}

      {/* ─── STEP 3: REVIEW ─── */}
      {step === 'review' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
              icon={CheckCircle2}
              count={validRows.length}
              label="Ready to import"
              tone="success"
            />
            <SummaryCard
              icon={FileWarning}
              count={duplicateRows.length}
              label="Duplicates detected"
              tone="warning"
            />
            <SummaryCard
              icon={AlertCircle}
              count={invalidRows.length}
              label="Rows with errors"
              tone="error"
            />
          </div>

          {validRows.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Preview ({Math.min(validRows.length, 5)} of {validRows.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="text-left py-2 pr-3">Company</th>
                        <th className="text-left py-2 pr-3">Contact</th>
                        <th className="text-left py-2 pr-3">Role</th>
                        <th className="text-left py-2 pr-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validRows.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="border-b border-border/50">
                          <td className="py-2 pr-3 font-medium">{row.application.company_name}</td>
                          <td className="py-2 pr-3 text-muted-foreground">{row.application.contact_number}</td>
                          <td className="py-2 pr-3 text-muted-foreground">{row.application.job_role || '—'}</td>
                          <td className="py-2 pr-3 text-muted-foreground">{row.application.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {duplicateRows.length > 0 && (
            <Card className="border-amber-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileWarning className="h-4 w-4 text-amber-400" />
                  Duplicates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  These rows match existing applications by company and contact number.
                </p>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={importDuplicates}
                    onChange={(e) => setImportDuplicates(e.target.checked)}
                    className="h-4 w-4"
                  />
                  Import duplicates anyway
                </label>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {duplicateRows.slice(0, 10).map((row, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground">
                      • {row.application.company_name} — {row.application.contact_number}
                    </div>
                  ))}
                  {duplicateRows.length > 10 && (
                    <div className="text-xs text-muted-foreground italic">
                      ...and {duplicateRows.length - 10} more
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {invalidRows.length > 0 && (
            <Card className="border-red-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  Rows that will be skipped
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {invalidRows.slice(0, 10).map((err, idx) => (
                    <div key={idx} className="text-xs">
                      <span className="text-red-400">Row {err.rowIndex + 2}:</span>{' '}
                      <span className="text-muted-foreground">{err.reason}</span>
                    </div>
                  ))}
                  {invalidRows.length > 10 && (
                    <div className="text-xs text-muted-foreground italic">
                      ...and {invalidRows.length - 10} more
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between gap-2">
            <Button variant="outline" onClick={() => setStep('map')}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to mapping
            </Button>
            <Button
              onClick={handleImport}
              disabled={isImporting || (validRows.length === 0 && !importDuplicates)}
            >
              {isImporting ? (
                <Spinner size="sm" />
              ) : (
                `Import ${importDuplicates ? validRows.length + duplicateRows.length : validRows.length} application${(importDuplicates ? validRows.length + duplicateRows.length : validRows.length) !== 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        </>
      )}

      {/* ─── STEP 4: RESULT ─── */}
      {step === 'result' && importResult && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-500/10 p-4">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-1">Import complete</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {importResult.successCount} application
              {importResult.successCount !== 1 ? 's' : ''} imported successfully
              {importResult.failureCount > 0 && `, ${importResult.failureCount} failed`}
            </p>

            {importResult.failures.length > 0 && (
              <div className="max-h-40 overflow-y-auto text-left bg-red-500/5 rounded-lg p-3 mb-6">
                <p className="text-xs font-medium text-red-400 mb-2">Failures:</p>
                {importResult.failures.slice(0, 10).map((f, idx) => (
                  <div key={idx} className="text-xs text-muted-foreground">
                    Row {f.rowIndex + 2}: {f.reason}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={handleReset}>
                Import another file
              </Button>
              <Button onClick={() => navigate('/applications')}>
                View applications
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'upload', label: '1. Upload' },
    { key: 'map', label: '2. Map columns' },
    { key: 'review', label: '3. Review' },
    { key: 'result', label: '4. Done' },
  ]
  const activeIndex = steps.findIndex((s) => s.key === currentStep)

  return (
    <div className="flex items-center gap-1 sm:gap-2 text-xs">
      {steps.map((s, idx) => (
        <div key={s.key} className="flex items-center gap-1 sm:gap-2">
          <span
            className={
              idx === activeIndex
                ? 'text-foreground font-medium'
                : idx < activeIndex
                ? 'text-muted-foreground'
                : 'text-muted-foreground/50'
            }
          >
            {s.label}
          </span>
          {idx < steps.length - 1 && (
            <ArrowRight className="h-3 w-3 text-muted-foreground/30" />
          )}
        </div>
      ))}
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  count,
  label,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  count: number
  label: string
  tone: 'success' | 'warning' | 'error'
}) {
  const colors = {
    success: 'text-green-400 bg-green-500/10',
    warning: 'text-amber-400 bg-amber-500/10',
    error: 'text-red-400 bg-red-500/10',
  }

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`rounded-lg p-2 ${colors[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xl font-semibold">{count}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
