import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Search,
    Plus,
    Filter,
    MoreHorizontal,
    Building2,
    Mail,
    Phone,
    Globe,
    ChevronLeft,
    ChevronRight,
    FileSpreadsheet,
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { useCompanies } from '@/hooks/useCompanies'
import { CompanyFormModal } from '@/components/companies/CompanyFormModal'
import { ImportExportModal } from '@/components/shared/ImportExportModal'
import { COMPANY_FIELDS, COMPANY_EXPORT_COLUMNS } from '@/lib/csv'
import { bulkCreateCompanies, getAllCompaniesForExport } from '@/lib/api/companies'
import type { CompanyFilters } from '@/lib/api/companies'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    prospecto: { label: 'Prospecto', color: '#3B82F6' },
    cliente_activo: { label: 'Cliente Activo', color: '#10B981' },
    cliente_inactivo: { label: 'Inactivo', color: '#94A3B8' },
    ex_cliente: { label: 'Ex-Cliente', color: '#EF4444' },
    partner: { label: 'Partner', color: '#8B5CF6' },
}

const TIER_MAP: Record<string, { label: string; color: string }> = {
    platinum: { label: 'Platinum', color: '#E5E7EB' },
    gold: { label: 'Gold', color: '#F59E0B' },
    silver: { label: 'Silver', color: '#9CA3AF' },
    bronze: { label: 'Bronze', color: '#CD7F32' },
}

export function CompaniesPage() {
    const navigate = useNavigate()
    const [page, setPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showImportExport, setShowImportExport] = useState(false)
    const [exportData, setExportData] = useState<Record<string, unknown>[]>([])
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

    const filters: CompanyFilters = useMemo(
        () => ({
            search: searchQuery || undefined,
            status: statusFilter || undefined,
        }),
        [searchQuery, statusFilter]
    )

    const { data, isLoading } = useCompanies(filters, {
        page,
        pageSize: 25,
        sortBy: 'created_at',
        sortOrder: 'desc',
    })

    const companies = data?.data ?? []
    const totalPages = data?.totalPages ?? 1
    const totalCount = data?.count ?? 0

    const toggleRow = (id: string) => {
        const next = new Set(selectedRows)
        next.has(id) ? next.delete(id) : next.add(id)
        setSelectedRows(next)
    }

    const toggleAll = () => {
        setSelectedRows(
            selectedRows.size === companies.length
                ? new Set()
                : new Set(companies.map((c) => c.id))
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Empresas</h1>
                    <p className="text-sm text-muted-foreground">Gestiona tu cartera de empresas</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={async () => {
                            const data = await getAllCompaniesForExport()
                            setExportData(data as unknown as Record<string, unknown>[])
                            setShowImportExport(true)
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-input px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        Importar / Exportar
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Nueva Empresa
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, CIF o email..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
                        className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                    className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                >
                    <option value="">Todos los estados</option>
                    {Object.entries(STATUS_MAP).map(([value, opt]) => (
                        <option key={value} value={value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="w-10 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={companies.length > 0 && selectedRows.size === companies.length}
                                        onChange={toggleAll}
                                        className="h-4 w-4 rounded border-input"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Empresa</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Contacto</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Estado</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Tier</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">ARR</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Tipo</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Creada</th>
                                <th className="w-10 px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b border-border">
                                        {Array.from({ length: 9 }).map((_, j) => (
                                            <td key={j} className="px-4 py-3">
                                                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : companies.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-16 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="rounded-full bg-muted p-4">
                                                <Building2 className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <h3 className="mt-4 text-sm font-semibold text-foreground">No hay empresas</h3>
                                            <p className="mt-1 text-sm text-muted-foreground">Crea tu primera empresa para empezar</p>
                                            <button
                                                onClick={() => setShowCreateModal(true)}
                                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Nueva Empresa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                companies.map((company) => {
                                    const status = STATUS_MAP[company.status]
                                    const tier = company.tier ? TIER_MAP[company.tier] : null
                                    const displayName = company.commercial_name || company.legal_name

                                    return (
                                        <tr
                                            key={company.id}
                                            onClick={() => navigate(`/companies/${company.id}`)}
                                            className={cn(
                                                'cursor-pointer border-b border-border transition-colors hover:bg-muted/50',
                                                selectedRows.has(company.id) && 'bg-primary/5'
                                            )}
                                        >
                                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.has(company.id)}
                                                    onChange={() => toggleRow(company.id)}
                                                    className="h-4 w-4 rounded border-input"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                                                        <Building2 className="h-4 w-4 text-purple-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">{displayName}</p>
                                                        {company.industry && (
                                                            <p className="text-xs text-muted-foreground">{company.industry}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="space-y-1">
                                                    {company.email && (
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <Mail className="h-3 w-3" />
                                                            {company.email}
                                                        </div>
                                                    )}
                                                    {company.phone && (
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <Phone className="h-3 w-3" />
                                                            {company.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {status && (
                                                    <span
                                                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                                                        style={{ backgroundColor: `${status.color}15`, color: status.color }}
                                                    >
                                                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.color }} />
                                                        {status.label}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {tier && (
                                                    <span
                                                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                                                        style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
                                                    >
                                                        {tier.label}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm font-medium text-foreground">
                                                    {formatCurrency(company.arr)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-muted-foreground">{company.type ?? '—'}</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                                {formatDate(company.created_at)}
                                            </td>
                                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                <button className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-accent [tr:hover_&]:opacity-100">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-border px-4 py-3">
                        <p className="text-sm text-muted-foreground">
                            {((page - 1) * 25) + 1}-{Math.min(page * 25, totalCount)} de {totalCount}
                        </p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-input text-sm disabled:opacity-50 hover:bg-accent">
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="px-3 text-sm font-medium">{page} / {totalPages}</span>
                            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-input text-sm disabled:opacity-50 hover:bg-accent">
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showCreateModal && <CompanyFormModal onClose={() => setShowCreateModal(false)} />}

            {/* Import/Export Modal */}
            {showImportExport && (
                <ImportExportModal
                    entityType="companies"
                    entityLabel="Empresas"
                    fields={COMPANY_FIELDS}
                    exportColumns={COMPANY_EXPORT_COLUMNS}
                    exportData={exportData}
                    onImport={async (records) => bulkCreateCompanies(records)}
                    onClose={() => setShowImportExport(false)}
                />
            )}
        </div>
    )
}
