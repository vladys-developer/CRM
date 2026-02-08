import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Search,
    Plus,
    Filter,
    MoreHorizontal,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Users,
    Mail,
    Phone,
    FileSpreadsheet,
} from 'lucide-react'
import { cn, formatDate, getInitials } from '@/lib/utils'
import { useContacts, useDeleteContact } from '@/hooks/useContacts'
import { CONTACT_STATUS_OPTIONS, CONTACT_SOURCE_OPTIONS, PRIORITY_OPTIONS } from '@/constants'
import { ContactFormModal } from '@/components/contacts/ContactFormModal'
import { ImportExportModal } from '@/components/shared/ImportExportModal'
import { CONTACT_FIELDS, CONTACT_EXPORT_COLUMNS } from '@/lib/csv'
import { bulkCreateContacts, getAllContactsForExport } from '@/lib/api/contacts'
import type { ContactFilters } from '@/lib/api/contacts'

export function ContactsPage() {
    const navigate = useNavigate()
    const [page, setPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showImportExport, setShowImportExport] = useState(false)
    const [exportData, setExportData] = useState<Record<string, unknown>[]>([])
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

    const filters: ContactFilters = useMemo(
        () => ({
            search: searchQuery || undefined,
            status: statusFilter || undefined,
        }),
        [searchQuery, statusFilter]
    )

    const { data, isLoading, error } = useContacts(filters, {
        page,
        pageSize: 25,
        sortBy: 'created_at',
        sortOrder: 'desc',
    })

    const deleteContact = useDeleteContact()

    const contacts = data?.data ?? []
    const totalPages = data?.totalPages ?? 1
    const totalCount = data?.count ?? 0

    const toggleRow = (id: string) => {
        const next = new Set(selectedRows)
        if (next.has(id)) {
            next.delete(id)
        } else {
            next.add(id)
        }
        setSelectedRows(next)
    }

    const toggleAll = () => {
        if (selectedRows.size === contacts.length) {
            setSelectedRows(new Set())
        } else {
            setSelectedRows(new Set(contacts.map((c) => c.id)))
        }
    }

    const getStatusBadge = (status: string) => {
        const opt = CONTACT_STATUS_OPTIONS.find((o) => o.value === status)
        return (
            <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{
                    backgroundColor: `${opt?.color}15`,
                    color: opt?.color,
                }}
            >
                <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: opt?.color }}
                />
                {opt?.label ?? status}
            </span>
        )
    }

    const getPriorityDot = (priority: string) => {
        const opt = PRIORITY_OPTIONS.find((o) => o.value === priority)
        return (
            <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: opt?.color }}
                title={opt?.label}
            />
        )
    }

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Contactos</h1>
                    <p className="text-sm text-muted-foreground">
                        Gestiona tu base de contactos y leads
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={async () => {
                            const data = await getAllContactsForExport()
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
                        Nuevo Contacto
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o teléfono..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setPage(1)
                        }}
                        className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30"
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value)
                            setPage(1)
                        }}
                        className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                        <option value="">Todos los estados</option>
                        {CONTACT_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            'flex h-9 items-center gap-2 rounded-lg border border-input px-3 text-sm transition-colors hover:bg-accent',
                            showFilters && 'border-primary bg-primary/5 text-primary'
                        )}
                    >
                        <Filter className="h-3.5 w-3.5" />
                        Filtros
                    </button>
                </div>
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
                                        checked={contacts.length > 0 && selectedRows.size === contacts.length}
                                        onChange={toggleAll}
                                        className="h-4 w-4 rounded border-input"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Contacto
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Email
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Teléfono
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Estado
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Lead Score
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Creado
                                </th>
                                <th className="w-10 px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                // Skeleton rows
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b border-border">
                                        <td className="px-4 py-3"><div className="h-4 w-4 animate-pulse rounded bg-muted" /></td>
                                        <td className="px-4 py-3"><div className="h-4 w-32 animate-pulse rounded bg-muted" /></td>
                                        <td className="px-4 py-3"><div className="h-4 w-40 animate-pulse rounded bg-muted" /></td>
                                        <td className="px-4 py-3"><div className="h-4 w-28 animate-pulse rounded bg-muted" /></td>
                                        <td className="px-4 py-3"><div className="h-5 w-20 animate-pulse rounded-full bg-muted" /></td>
                                        <td className="px-4 py-3"><div className="h-4 w-12 animate-pulse rounded bg-muted" /></td>
                                        <td className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-muted" /></td>
                                        <td className="px-4 py-3" />
                                    </tr>
                                ))
                            ) : contacts.length === 0 ? (
                                // Empty state
                                <tr>
                                    <td colSpan={8} className="px-4 py-16 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="rounded-full bg-muted p-4">
                                                <Users className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <h3 className="mt-4 text-sm font-semibold text-foreground">
                                                No hay contactos
                                            </h3>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Crea tu primer contacto para empezar
                                            </p>
                                            <button
                                                onClick={() => setShowCreateModal(true)}
                                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Nuevo Contacto
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                contacts.map((contact) => (
                                    <tr
                                        key={contact.id}
                                        onClick={() => navigate(`/contacts/${contact.id}`)}
                                        className={cn(
                                            'cursor-pointer border-b border-border transition-colors hover:bg-muted/50',
                                            selectedRows.has(contact.id) && 'bg-primary/5'
                                        )}
                                    >
                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.has(contact.id)}
                                                onChange={() => toggleRow(contact.id)}
                                                className="h-4 w-4 rounded border-input"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                                    {getInitials(
                                                        `${contact.first_name} ${contact.last_name ?? ''}`
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">
                                                        {contact.first_name} {contact.last_name}
                                                    </p>
                                                    {contact.job_title && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {contact.job_title}
                                                        </p>
                                                    )}
                                                </div>
                                                {getPriorityDot(contact.priority)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {contact.email ? (
                                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                    <Mail className="h-3 w-3" />
                                                    {contact.email}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground/50">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {contact.phone_mobile ? (
                                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                    <Phone className="h-3 w-3" />
                                                    {contact.phone_mobile}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground/50">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">{getStatusBadge(contact.status)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full rounded-full bg-primary transition-all"
                                                        style={{ width: `${contact.lead_score}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    {contact.lead_score}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                            {formatDate(contact.created_at)}
                                        </td>
                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                            <button className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-accent group-hover:opacity-100 [tr:hover_&]:opacity-100">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-border px-4 py-3">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {((page - 1) * 25) + 1}-{Math.min(page * 25, totalCount)} de {totalCount}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-input text-sm disabled:opacity-50 hover:bg-accent"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="px-3 text-sm font-medium">
                                {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-input text-sm disabled:opacity-50 hover:bg-accent"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <ContactFormModal
                    onClose={() => setShowCreateModal(false)}
                />
            )}

            {/* Import/Export Modal */}
            {showImportExport && (
                <ImportExportModal
                    entityType="contacts"
                    entityLabel="Contactos"
                    fields={CONTACT_FIELDS}
                    exportColumns={CONTACT_EXPORT_COLUMNS}
                    exportData={exportData}
                    onImport={async (records) => bulkCreateContacts(records)}
                    onClose={() => setShowImportExport(false)}
                />
            )}
        </div>
    )
}
