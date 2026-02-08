/**
 * CSV Import/Export Utilities
 * Parse CSV to objects, generate CSV from data, field mapping, download.
 */

// --------------- PARSE ---------------

export interface ParsedCSV {
    headers: string[]
    rows: Record<string, string>[]
    rawRows: string[][]
}

export function parseCSV(text: string): ParsedCSV {
    const lines = text.trim().split(/\r?\n/)
    if (lines.length < 2) return { headers: [], rows: [], rawRows: [] }

    const headers = parseLine(lines[0]!)
    const rawRows: string[][] = []
    const rows: Record<string, string>[] = []

    for (let i = 1; i < lines.length; i++) {
        const cells = parseLine(lines[i]!)
        if (cells.every((c) => c === '')) continue // skip empty rows
        rawRows.push(cells)
        const row: Record<string, string> = {}
        headers.forEach((h, idx) => {
            row[h] = cells[idx] ?? ''
        })
        rows.push(row)
    }

    return { headers, rows, rawRows }
}

/** Parse a single CSV line respecting quoted fields */
function parseLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
        const ch = line[i]
        if (inQuotes) {
            if (ch === '"') {
                if (line[i + 1] === '"') {
                    current += '"'
                    i++ // skip escaped quote
                } else {
                    inQuotes = false
                }
            } else {
                current += ch
            }
        } else {
            if (ch === '"') {
                inQuotes = true
            } else if (ch === ',' || ch === ';') {
                result.push(current.trim())
                current = ''
            } else {
                current += ch
            }
        }
    }
    result.push(current.trim())
    return result
}

// --------------- GENERATE ---------------

export function generateCSV(
    data: Record<string, unknown>[],
    columns: { key: string; label: string }[]
): string {
    const header = columns.map((c) => escapeCSV(c.label)).join(',')
    const rows = data.map((row) =>
        columns.map((c) => escapeCSV(String(row[c.key] ?? ''))).join(',')
    )
    return [header, ...rows].join('\n')
}

function escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`
    }
    return value
}

// --------------- DOWNLOAD ---------------

export function downloadCSV(csv: string, filename: string) {
    const BOM = '\uFEFF' // UTF-8 BOM for Excel compatibility
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

// --------------- FIELD MAPPING ---------------

export interface FieldMapping {
    csvHeader: string
    dbField: string
}

export const CONTACT_FIELDS = [
    { key: 'first_name', label: 'Nombre', required: true },
    { key: 'last_name', label: 'Apellido', required: false },
    { key: 'email', label: 'Email', required: false },
    { key: 'phone_mobile', label: 'Teléfono Móvil', required: false },
    { key: 'phone_landline', label: 'Teléfono Fijo', required: false },
    { key: 'phone_whatsapp', label: 'WhatsApp', required: false },
    { key: 'job_title', label: 'Cargo', required: false },
    { key: 'department', label: 'Departamento', required: false },
    { key: 'status', label: 'Estado', required: false },
    { key: 'source', label: 'Fuente', required: false },
    { key: 'priority', label: 'Prioridad', required: false },
    { key: 'lead_score', label: 'Lead Score', required: false },
] as const

export const COMPANY_FIELDS = [
    { key: 'legal_name', label: 'Razón Social', required: true },
    { key: 'commercial_name', label: 'Nombre Comercial', required: false },
    { key: 'nif_cif', label: 'NIF/CIF', required: false },
    { key: 'industry', label: 'Industria', required: false },
    { key: 'type', label: 'Tipo (B2B/B2C)', required: false },
    { key: 'employee_range', label: 'Rango Empleados', required: false },
    { key: 'phone', label: 'Teléfono', required: false },
    { key: 'email', label: 'Email', required: false },
    { key: 'website', label: 'Website', required: false },
    { key: 'status', label: 'Estado', required: false },
    { key: 'client_type', label: 'Tipo Cliente', required: false },
    { key: 'tier', label: 'Tier', required: false },
    { key: 'territory', label: 'Territorio', required: false },
] as const

/** Auto-map CSV headers to DB fields using fuzzy matching */
export function autoMapFields(
    csvHeaders: string[],
    dbFields: readonly { key: string; label: string; required: boolean }[]
): FieldMapping[] {
    return csvHeaders
        .map((csvH) => {
            const normalized = csvH.toLowerCase().trim()
            const match = dbFields.find(
                (f) =>
                    f.key.toLowerCase() === normalized ||
                    f.label.toLowerCase() === normalized ||
                    f.key.toLowerCase().replace(/_/g, ' ') === normalized ||
                    f.label.toLowerCase().replace(/[áéíóú]/g, (c) =>
                        ({ á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' } as Record<string, string>)[c] ?? c
                    ) === normalized
            )
            return {
                csvHeader: csvH,
                dbField: match?.key ?? '',
            }
        })
}

/** Convert mapped CSV rows into DB-ready objects */
export function applyMapping<T extends Record<string, unknown>>(
    rows: Record<string, string>[],
    mappings: FieldMapping[]
): Partial<T>[] {
    return rows.map((row) => {
        const obj: Record<string, unknown> = {}
        mappings.forEach((m) => {
            if (m.dbField && row[m.csvHeader] !== undefined) {
                const val = row[m.csvHeader].trim()
                if (val !== '') {
                    // Convert numbers for numeric fields
                    if (m.dbField === 'lead_score' || m.dbField === 'annual_revenue') {
                        obj[m.dbField] = Number(val) || 0
                    } else {
                        obj[m.dbField] = val
                    }
                }
            }
        })
        return obj as Partial<T>
    })
}

// --------------- EXPORT COLUMNS ---------------

export const CONTACT_EXPORT_COLUMNS = [
    { key: 'first_name', label: 'Nombre' },
    { key: 'last_name', label: 'Apellido' },
    { key: 'email', label: 'Email' },
    { key: 'phone_mobile', label: 'Teléfono Móvil' },
    { key: 'job_title', label: 'Cargo' },
    { key: 'status', label: 'Estado' },
    { key: 'source', label: 'Fuente' },
    { key: 'priority', label: 'Prioridad' },
    { key: 'lead_score', label: 'Lead Score' },
    { key: 'created_at', label: 'Fecha Creación' },
]

export const COMPANY_EXPORT_COLUMNS = [
    { key: 'legal_name', label: 'Razón Social' },
    { key: 'commercial_name', label: 'Nombre Comercial' },
    { key: 'nif_cif', label: 'NIF/CIF' },
    { key: 'industry', label: 'Industria' },
    { key: 'type', label: 'Tipo' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'email', label: 'Email' },
    { key: 'website', label: 'Website' },
    { key: 'status', label: 'Estado' },
    { key: 'tier', label: 'Tier' },
    { key: 'created_at', label: 'Fecha Creación' },
]
