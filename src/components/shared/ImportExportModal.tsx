import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Upload,
    Download,
    X,
    FileSpreadsheet,
    Check,
    AlertCircle,
    ArrowRight,
    Loader2,
    ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
    parseCSV,
    generateCSV,
    downloadCSV,
    autoMapFields,
    applyMapping,
    type FieldMapping,
    type ParsedCSV,
} from '@/lib/csv'

interface ImportExportModalProps {
    entityType: 'contacts' | 'companies'
    entityLabel: string
    fields: readonly { key: string; label: string; required: boolean }[]
    exportColumns: { key: string; label: string }[]
    exportData: Record<string, unknown>[]
    onImport: (records: Record<string, unknown>[]) => Promise<{ success: number; errors: number }>
    onClose: () => void
}

type Step = 'choose' | 'upload' | 'mapping' | 'preview' | 'importing' | 'done'

export function ImportExportModal({
    entityType,
    entityLabel,
    fields,
    exportColumns,
    exportData,
    onImport,
    onClose,
}: ImportExportModalProps) {
    const [step, setStep] = useState<Step>('choose')
    const [parsed, setParsed] = useState<ParsedCSV | null>(null)
    const [mappings, setMappings] = useState<FieldMapping[]>([])
    const [fileName, setFileName] = useState('')
    const [result, setResult] = useState<{ success: number; errors: number } | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    // ---- Export ----
    const handleExport = useCallback(() => {
        const csv = generateCSV(exportData, exportColumns)
        const date = new Date().toISOString().split('T')[0]
        downloadCSV(csv, `${entityType}_${date}.csv`)
        toast.success(`${exportData.length} ${entityLabel.toLowerCase()} exportados`)
        onClose()
    }, [exportData, exportColumns, entityType, entityLabel, onClose])

    // ---- Import: file read ----
    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (!file) return
            setFileName(file.name)

            const reader = new FileReader()
            reader.onload = (ev) => {
                const text = ev.target?.result as string
                const csv = parseCSV(text)
                if (csv.headers.length === 0) {
                    toast.error('El archivo CSV está vacío o no tiene formato válido')
                    return
                }
                setParsed(csv)
                const autoMapped = autoMapFields(csv.headers, fields)
                setMappings(autoMapped)
                setStep('mapping')
            }
            reader.readAsText(file)
        },
        [fields]
    )

    // ---- Import: update a mapping ----
    const updateMapping = (csvHeader: string, dbField: string) => {
        setMappings((prev) =>
            prev.map((m) => (m.csvHeader === csvHeader ? { ...m, dbField } : m))
        )
    }

    // ---- Import: execute ----
    const executeImport = async () => {
        if (!parsed) return
        const activeMappings = mappings.filter((m) => m.dbField)

        // Validate required fields
        const requiredFields = fields.filter((f) => f.required)
        const missingRequired = requiredFields.filter(
            (f) => !activeMappings.some((m) => m.dbField === f.key)
        )
        if (missingRequired.length > 0) {
            toast.error(
                `Campos requeridos sin mapear: ${missingRequired.map((f) => f.label).join(', ')}`
            )
            return
        }

        setStep('importing')
        try {
            const records = applyMapping(parsed.rows, activeMappings)
            const res = await onImport(records as Record<string, unknown>[])
            setResult(res)
            setStep('done')
        } catch (err) {
            toast.error('Error durante la importación')
            setStep('preview')
        }
    }

    // ---- Preview data ----
    const previewData = parsed
        ? applyMapping(parsed.rows.slice(0, 5), mappings.filter((m) => m.dbField))
        : []

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-2xl rounded-2xl bg-card border border-border shadow-2xl mx-4 max-h-[85vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                            <FileSpreadsheet className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">
                                {step === 'choose'
                                    ? `Importar / Exportar ${entityLabel}`
                                    : step === 'done'
                                        ? 'Importación Completada'
                                        : `Importar ${entityLabel}`}
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                {step === 'choose' && 'Selecciona una acción'}
                                {step === 'upload' && 'Sube un archivo CSV'}
                                {step === 'mapping' && 'Mapea las columnas del CSV'}
                                {step === 'preview' && 'Revisa antes de importar'}
                                {step === 'importing' && 'Importando registros...'}
                                {step === 'done' && `${result?.success ?? 0} registros importados`}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 hover:bg-accent transition-colors">
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    <AnimatePresence mode="wait">
                        {/* Step: Choose */}
                        {step === 'choose' && (
                            <motion.div
                                key="choose"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="grid grid-cols-2 gap-4"
                            >
                                <button
                                    onClick={() => setStep('upload')}
                                    className="group flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-border p-8 transition-all hover:border-primary hover:bg-primary/5"
                                >
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 transition-colors group-hover:bg-blue-500/20">
                                        <Upload className="h-7 w-7" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold text-foreground">Importar CSV</p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Sube un archivo CSV con los datos
                                        </p>
                                    </div>
                                </button>

                                <button
                                    onClick={handleExport}
                                    className="group flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-border p-8 transition-all hover:border-emerald-500 hover:bg-emerald-500/5"
                                >
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 transition-colors group-hover:bg-emerald-500/20">
                                        <Download className="h-7 w-7" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold text-foreground">Exportar CSV</p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Descarga {exportData.length} registros
                                        </p>
                                    </div>
                                </button>
                            </motion.div>
                        )}

                        {/* Step: Upload */}
                        {step === 'upload' && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    className="flex cursor-pointer flex-col items-center gap-4 rounded-xl border-2 border-dashed border-border p-12 transition-all hover:border-primary hover:bg-primary/5"
                                >
                                    <Upload className="h-10 w-10 text-muted-foreground" />
                                    <div className="text-center">
                                        <p className="font-semibold text-foreground">
                                            Haz clic para seleccionar un archivo CSV
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Formatos: .csv — separado por comas o punto y coma
                                        </p>
                                    </div>
                                </div>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </motion.div>
                        )}

                        {/* Step: Mapping */}
                        {step === 'mapping' && parsed && (
                            <motion.div
                                key="mapping"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 px-4 py-2 text-sm text-blue-600 dark:text-blue-400">
                                    <FileSpreadsheet className="h-4 w-4" />
                                    <span className="font-medium">{fileName}</span>
                                    <span className="text-muted-foreground">
                                        — {parsed.rows.length} filas detectadas
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div className="grid grid-cols-[1fr,auto,1fr] gap-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        <span>Columna CSV</span>
                                        <span />
                                        <span>Campo CRM</span>
                                    </div>
                                    {mappings.map((m) => (
                                        <div
                                            key={m.csvHeader}
                                            className="grid grid-cols-[1fr,auto,1fr] items-center gap-2 rounded-lg border border-border px-3 py-2"
                                        >
                                            <span className="truncate text-sm font-medium text-foreground">
                                                {m.csvHeader}
                                            </span>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            <div className="relative">
                                                <select
                                                    value={m.dbField}
                                                    onChange={(e) =>
                                                        updateMapping(m.csvHeader, e.target.value)
                                                    }
                                                    className={cn(
                                                        'h-8 w-full appearance-none rounded-lg border border-input bg-background px-3 pr-8 text-sm outline-none focus:border-primary',
                                                        m.dbField
                                                            ? 'text-foreground'
                                                            : 'text-muted-foreground'
                                                    )}
                                                >
                                                    <option value="">— Ignorar —</option>
                                                    {fields.map((f) => (
                                                        <option key={f.key} value={f.key}>
                                                            {f.label}
                                                            {f.required ? ' *' : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Step: Preview */}
                        {step === 'preview' && (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                <p className="text-sm text-muted-foreground">
                                    Vista previa de las primeras 5 filas (de{' '}
                                    {parsed?.rows.length ?? 0} totales):
                                </p>
                                <div className="overflow-x-auto rounded-lg border border-border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/50">
                                                {mappings
                                                    .filter((m) => m.dbField)
                                                    .map((m) => (
                                                        <th
                                                            key={m.dbField}
                                                            className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                                                        >
                                                            {fields.find(
                                                                (f) => f.key === m.dbField
                                                            )?.label ?? m.dbField}
                                                        </th>
                                                    ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.map((row, i) => (
                                                <tr
                                                    key={i}
                                                    className="border-b border-border last:border-0"
                                                >
                                                    {mappings
                                                        .filter((m) => m.dbField)
                                                        .map((m) => (
                                                            <td
                                                                key={m.dbField}
                                                                className="px-3 py-2 text-foreground"
                                                            >
                                                                {String(
                                                                    row[m.dbField as keyof typeof row] ??
                                                                    ''
                                                                )}
                                                            </td>
                                                        ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {/* Step: Importing */}
                        {step === 'importing' && (
                            <motion.div
                                key="importing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center gap-4 py-12"
                            >
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <p className="font-medium text-foreground">
                                    Importando {parsed?.rows.length ?? 0} registros...
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Esto puede tardar unos segundos
                                </p>
                            </motion.div>
                        )}

                        {/* Step: Done */}
                        {step === 'done' && result && (
                            <motion.div
                                key="done"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center gap-4 py-8"
                            >
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                                    <Check className="h-8 w-8 text-emerald-500" />
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-semibold text-foreground">
                                        Importación finalizada
                                    </p>
                                    <div className="mt-3 flex items-center gap-6">
                                        <div className="flex items-center gap-2 text-emerald-500">
                                            <Check className="h-4 w-4" />
                                            <span className="text-sm font-medium">
                                                {result.success} correctos
                                            </span>
                                        </div>
                                        {result.errors > 0 && (
                                            <div className="flex items-center gap-2 text-red-500">
                                                <AlertCircle className="h-4 w-4" />
                                                <span className="text-sm font-medium">
                                                    {result.errors} errores
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border px-6 py-4">
                    <button
                        onClick={() => {
                            if (step === 'mapping') setStep('upload')
                            else if (step === 'preview') setStep('mapping')
                            else onClose()
                        }}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
                    >
                        {step === 'done' || step === 'choose' ? 'Cerrar' : 'Atrás'}
                    </button>

                    {step === 'mapping' && (
                        <button
                            onClick={() => setStep('preview')}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            Vista Previa
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    )}

                    {step === 'preview' && (
                        <button
                            onClick={executeImport}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
                        >
                            <Upload className="h-4 w-4" />
                            Importar {parsed?.rows.length ?? 0} registros
                        </button>
                    )}

                    {step === 'done' && (
                        <button
                            onClick={onClose}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            Listo
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
