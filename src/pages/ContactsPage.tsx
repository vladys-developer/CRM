import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Search,
    Plus,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Users,
    Mail,
    Phone,
    FileSpreadsheet,
    UserPlus,
} from 'lucide-react'
import { cn, formatDate, getInitials } from '@/lib/utils'
import { useContacts, useDeleteContact } from '@/hooks/useContacts'
import { CONTACT_STATUS_OPTIONS } from '@/constants'
import { ContactFormModal } from '@/components/contacts/ContactFormModal'
import { ImportExportModal } from '@/components/shared/ImportExportModal'
import { CONTACT_FIELDS, CONTACT_EXPORT_COLUMNS } from '@/lib/csv'
import { bulkCreateContacts, getAllContactsForExport } from '@/lib/api/contacts'
import type { ContactFilters } from '@/lib/api/contacts'

// Avatar color palette for initials
const avatarColors = [
    'from-emerald-400 to-emerald-600',
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-amber-400 to-amber-600',
    'from-pink-400 to-pink-600',
    'from-indigo-400 to-indigo-600',
    'from-teal-400 to-teal-600',
    'from-rose-400 to-rose-600',
]

function getAvatarColor(name: string) {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return avatarColors[Math.abs(hash) % avatarColors.length]
}

// Status badge config
const statusConfig: Record<string, { bg: string; text: string; border: string }> = {
    active: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
    lead: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
    customer: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
    inactive: { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-100' },
    prospect: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
    churned: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
}

const defaultStatus = { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-100' }

export function ContactsPage() {
    const navigate = useNavigate()
    const [page, setPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showImportExport, setShowImportExport] = useState(false)
    const [exportData, setExportData] = useState<Record<string, unknown>[]>([])

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
    const pageStart = (page - 1) * 25 + 1
    const pageEnd = Math.min(page * 25, totalCount)

    return (
        <div className="space-y-5 max-w-[1400px]">
            {/* Page Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Contact Directory</h1>
                    <p className="text-sm font-medium text-gray-500 mt-1">
                        Manage and track your high-value sales relationships.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={async () => {
                            const data = await getAllContactsForExport()
                            setExportData(data as unknown as Record<string, unknown>[])
                            setShowImportExport(true)
                        }}
                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                    >
                        <FileSpreadsheet className="h-4 w-4 text-gray-400" />
                        Import / Export
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 rounded-xl bg-[#1a1f36] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-gray-900/10 transition-all hover:bg-[#252b45] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <UserPlus className="h-4 w-4" />
                        New Contact
                    </button>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setPage(1)
                        }}
                        placeholder="Search by name, email, or company..."
                        className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10"
                    />
                </div>

                {/* Status filter pills */}
                <div className="flex items-center gap-1.5">
                    {['', 'active', 'lead', 'customer', 'inactive'].map((val) => {
                        const label = val === '' ? 'All' : val.charAt(0).toUpperCase() + val.slice(1)
                        return (
                            <button
                                key={val}
                                onClick={() => {
                                    setStatusFilter(val)
                                    setPage(1)
                                }}
                                className={cn(
                                    'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                                    statusFilter === val
                                        ? 'bg-gray-900 text-white shadow-sm'
                                        : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                                )}
                            >
                                {label}
                            </button>
                        )
                    })}
                </div>

                {/* Results count */}
                <div className="ml-auto text-xs text-gray-400 font-medium">
                    Showing {pageStart} to {pageEnd} of {totalCount} results
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-8">
                        <div className="space-y-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="h-10 w-10 animate-pulse rounded-full bg-gray-50" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-1/3 animate-pulse rounded bg-gray-50" />
                                        <div className="h-2 w-1/4 animate-pulse rounded bg-gray-50" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16 text-red-500">
                        <p className="text-sm font-medium">Error loading contacts</p>
                        <p className="text-xs text-gray-400 mt-1">{String(error)}</p>
                    </div>
                ) : contacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <div className="rounded-full bg-gray-50 p-6 mb-4">
                            <Users className="h-10 w-10 opacity-30" />
                        </div>
                        <p className="text-base font-medium text-gray-600 mb-1">No contacts found</p>
                        <p className="text-sm text-gray-400 mb-4">
                            {searchQuery ? 'Try a different search term' : 'Add your first contact to get started'}
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600"
                        >
                            <Plus className="h-4 w-4" />
                            Add Contact
                        </button>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/80">
                                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">
                                    Contact
                                </th>
                                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">
                                    Status
                                </th>
                                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">
                                    Position
                                </th>
                                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">
                                    Phone
                                </th>
                                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">
                                    Lead Score
                                </th>
                                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">
                                    Added
                                </th>
                                <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {contacts.map((contact) => {
                                const fullName = `${contact.first_name ?? ''} ${contact.last_name ?? ''}`.trim() || 'Sin nombre'
                                const initials = getInitials(fullName)
                                const colorGradient = getAvatarColor(fullName)
                                const statusKey = contact.status?.toLowerCase() ?? 'inactive'
                                const sConfig = statusConfig[statusKey] ?? defaultStatus

                                return (
                                    <tr
                                        key={contact.id}
                                        onClick={() => navigate(`/contacts/${contact.id}`)}
                                        className="group cursor-pointer transition-colors hover:bg-gray-50/80"
                                    >
                                        {/* Contact */}
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white shadow-sm',
                                                    colorGradient
                                                )}>
                                                    {initials}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                                                        {fullName}
                                                    </p>
                                                    <p className="text-xs text-gray-400">{contact.email ?? '—'}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-3.5">
                                            <span className={cn(
                                                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                                                sConfig.bg, sConfig.text, sConfig.border
                                            )}>
                                                {CONTACT_STATUS_OPTIONS.find(o => o.value === contact.status)?.label ?? contact.status ?? '—'}
                                            </span>
                                        </td>

                                        {/* Position */}
                                        <td className="px-5 py-3.5">
                                            <span className="text-sm text-gray-700">
                                                {contact.job_title ?? '—'}
                                            </span>
                                        </td>

                                        {/* Phone */}
                                        <td className="px-5 py-3.5">
                                            <span className="text-sm text-gray-500 font-mono text-xs">
                                                {contact.phone_mobile ?? '—'}
                                            </span>
                                        </td>

                                        {/* Lead Score */}
                                        <td className="px-5 py-3.5">
                                            <span className="text-sm text-gray-500">
                                                {contact.lead_score != null
                                                    ? contact.lead_score
                                                    : '—'}
                                            </span>
                                        </td>

                                        {/* Added */}
                                        <td className="px-5 py-3.5">
                                            <span className="text-sm text-gray-500">
                                                {formatDate(contact.created_at)}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        window.location.href = `mailto:${contact.email}`
                                                    }}
                                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                                    title="Send Email"
                                                >
                                                    <Mail className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        window.location.href = `tel:${contact.phone_mobile}`
                                                    }}
                                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                    title="Call"
                                                >
                                                    <Phone className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        if (confirm('¿Eliminar este contacto?')) {
                                                            deleteContact.mutate(contact.id)
                                                        }
                                                    }}
                                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                        Page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                            let pageNum: number
                            if (totalPages <= 5) {
                                pageNum = i + 1
                            } else if (page <= 3) {
                                pageNum = i + 1
                            } else if (page >= totalPages - 2) {
                                pageNum = totalPages - 4 + i
                            } else {
                                pageNum = page - 2 + i
                            }
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={cn(
                                        'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors',
                                        page === pageNum
                                            ? 'bg-gray-900 text-white shadow-sm'
                                            : 'text-gray-500 hover:bg-gray-50'
                                    )}
                                >
                                    {pageNum}
                                </button>
                            )
                        })}
                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showCreateModal && (
                <ContactFormModal onClose={() => setShowCreateModal(false)} />
            )}

            {showImportExport && (
                <ImportExportModal
                    entityType="contacts"
                    entityLabel="Contactos"
                    fields={CONTACT_FIELDS}
                    exportColumns={CONTACT_EXPORT_COLUMNS}
                    exportData={exportData}
                    onImport={bulkCreateContacts}
                    onClose={() => setShowImportExport(false)}
                />
            )}
        </div>
    )
}
