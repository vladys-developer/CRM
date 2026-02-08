import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Search, Plus, ChevronLeft, ChevronRight,
    Target, Calendar, Building2, User,
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { useOpportunities } from '@/hooks/useOpportunities'
import type { OpportunityFilters } from '@/lib/api/opportunities'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    abierto: { label: 'Abierto', color: '#3B82F6' },
    ganado: { label: 'Ganado', color: '#10B981' },
    perdido: { label: 'Perdido', color: '#EF4444' },
    descartado: { label: 'Descartado', color: '#94A3B8' },
}

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
    alta: { label: 'Alta', color: '#EF4444' },
    media: { label: 'Media', color: '#F59E0B' },
    baja: { label: 'Baja', color: '#10B981' },
}

export function OpportunitiesPage() {
    const navigate = useNavigate()
    const [page, setPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    const filters: OpportunityFilters = useMemo(
        () => ({ search: searchQuery || undefined, status: statusFilter || undefined }),
        [searchQuery, statusFilter]
    )

    const { data, isLoading } = useOpportunities(filters, {
        page, pageSize: 25, sortBy: 'created_at', sortOrder: 'desc',
    })

    const opportunities = data?.data ?? []
    const totalPages = data?.totalPages ?? 1
    const totalCount = data?.count ?? 0

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Oportunidades</h1>
                    <p className="text-sm text-muted-foreground">Gestiona tu pipeline de ventas</p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-4 w-4" />Nueva Oportunidad
                </button>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" placeholder="Buscar oportunidades..."
                        value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
                        className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30" />
                </div>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                    className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary">
                    <option value="">Todos</option>
                    {Object.entries(STATUS_MAP).map(([v, o]) => <option key={v} value={v}>{o.label}</option>)}
                </select>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Oportunidad</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Empresa</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Valor</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Etapa</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Estado</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Probabilidad</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Cierre Est.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b border-border">
                                        {Array.from({ length: 7 }).map((_, j) => (
                                            <td key={j} className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-muted" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : opportunities.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-16 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="rounded-full bg-muted p-4"><Target className="h-8 w-8 text-muted-foreground" /></div>
                                            <h3 className="mt-4 text-sm font-semibold text-foreground">Sin oportunidades</h3>
                                            <p className="mt-1 text-sm text-muted-foreground">Crea tu primera oportunidad</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                opportunities.map((opp) => {
                                    const status = STATUS_MAP[opp.status]
                                    const companyName = opp.company ? opp.company.commercial_name || opp.company.legal_name : '—'

                                    return (
                                        <tr key={opp.id} className="cursor-pointer border-b border-border transition-colors hover:bg-muted/50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                                                        <Target className="h-4 w-4 text-emerald-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">{opp.name}</p>
                                                        {opp.contact && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {opp.contact.first_name} {opp.contact.last_name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">{companyName}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-foreground">{formatCurrency(opp.monetary_value)}</td>
                                            <td className="px-4 py-3">
                                                {opp.stage && (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                                                        style={{ backgroundColor: `${opp.stage.color}15`, color: opp.stage.color }}>
                                                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: opp.stage.color }} />
                                                        {opp.stage.name}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {status && (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                                                        style={{ backgroundColor: `${status.color}15`, color: status.color }}>
                                                        {status.label}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                                                        <div className="h-full rounded-full bg-primary/70" style={{ width: `${opp.close_probability}%` }} />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">{opp.close_probability}%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                                {opp.estimated_close_date ? formatDate(opp.estimated_close_date) : '—'}
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
                        <p className="text-sm text-muted-foreground">{((page - 1) * 25) + 1}-{Math.min(page * 25, totalCount)} de {totalCount}</p>
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
        </div>
    )
}
