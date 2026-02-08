import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft, Edit2, Trash2, Building2, Mail, Phone, Globe,
    Calendar, Users, Target, TrendingUp, MapPin, BarChart3,
} from 'lucide-react'
import { cn, formatCurrency, formatDate, getInitials } from '@/lib/utils'
import { useCompany, useDeleteCompany } from '@/hooks/useCompanies'
import { CompanyFormModal } from '@/components/companies/CompanyFormModal'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    prospecto: { label: 'Prospecto', color: '#3B82F6' },
    cliente_activo: { label: 'Cliente Activo', color: '#10B981' },
    cliente_inactivo: { label: 'Inactivo', color: '#94A3B8' },
    ex_cliente: { label: 'Ex-Cliente', color: '#EF4444' },
    partner: { label: 'Partner', color: '#8B5CF6' },
}

export function CompanyDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { data: company, isLoading } = useCompany(id)
    const deleteCompany = useDeleteCompany()
    const [showEditModal, setShowEditModal] = useState(false)
    const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'opportunities'>('overview')

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-40 animate-pulse rounded bg-muted" />
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="h-44 animate-pulse rounded-xl bg-muted" />
                        <div className="h-60 animate-pulse rounded-xl bg-muted" />
                    </div>
                    <div className="h-80 animate-pulse rounded-xl bg-muted" />
                </div>
            </div>
        )
    }

    if (!company) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center">
                <p className="text-lg font-medium text-foreground">Empresa no encontrada</p>
                <button onClick={() => navigate('/companies')} className="mt-4 text-sm text-primary hover:text-primary/80">
                    Volver a empresas
                </button>
            </div>
        )
    }

    const status = STATUS_MAP[company.status]
    const displayName = company.commercial_name || company.legal_name

    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro de eliminar esta empresa?')) {
            await deleteCompany.mutateAsync(company.id)
            navigate('/companies')
        }
    }

    const tabs = [
        { id: 'overview' as const, label: 'Resumen' },
        { id: 'contacts' as const, label: 'Contactos' },
        { id: 'opportunities' as const, label: 'Oportunidades' },
    ]

    return (
        <div className="space-y-6">
            <button onClick={() => navigate('/companies')}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />Empresas
            </button>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header Card */}
                    <div className="rounded-xl border border-border bg-card p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-xl font-bold text-purple-500">
                                    <Building2 className="h-8 w-8" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-foreground">{displayName}</h1>
                                    {company.commercial_name && company.legal_name !== company.commercial_name && (
                                        <p className="text-sm text-muted-foreground">{company.legal_name}</p>
                                    )}
                                    <div className="mt-2 flex items-center gap-2">
                                        {status && (
                                            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                                                style={{ backgroundColor: `${status.color}15`, color: status.color }}>
                                                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.color }} />
                                                {status.label}
                                            </span>
                                        )}
                                        {company.type && (
                                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                                {company.type}
                                            </span>
                                        )}
                                        {company.tier && (
                                            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
                                                {company.tier.charAt(0).toUpperCase() + company.tier.slice(1)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setShowEditModal(true)}
                                    className="flex h-9 items-center gap-2 rounded-lg border border-input px-3 text-sm font-medium transition-colors hover:bg-accent">
                                    <Edit2 className="h-3.5 w-3.5" />Editar
                                </button>
                                <button onClick={handleDelete}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-input text-destructive transition-colors hover:bg-destructive/10">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Quick Info */}
                        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {company.email && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4 shrink-0" /><span className="truncate">{company.email}</span>
                                </div>
                            )}
                            {company.phone && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-4 w-4 shrink-0" /><span>{company.phone}</span>
                                </div>
                            )}
                            {company.website && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Globe className="h-4 w-4 shrink-0" /><span className="truncate">{company.website}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 shrink-0" /><span>{formatDate(company.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="rounded-xl border border-border bg-card">
                        <div className="flex border-b border-border px-4">
                            {tabs.map((tab) => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        'relative px-4 py-3 text-sm font-medium transition-colors',
                                        activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                    )}>
                                    {tab.label}
                                    {activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                                </button>
                            ))}
                        </div>

                        <div className="p-6">
                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Razón Social', value: company.legal_name },
                                        { label: 'Nombre Comercial', value: company.commercial_name },
                                        { label: 'CIF/NIF', value: company.nif_cif },
                                        { label: 'Industria', value: company.industry },
                                        { label: 'Subsector', value: company.subsector },
                                        { label: 'Empleados', value: company.employee_range },
                                        { label: 'Año Fundación', value: company.founded_year?.toString() },
                                        { label: 'Territorio', value: company.territory },
                                        { label: 'Facturación Anual', value: company.annual_revenue ? formatCurrency(company.annual_revenue) : null },
                                    ].map((item) => (
                                        <div key={item.label}>
                                            <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                                            <p className="mt-0.5 text-sm text-foreground">
                                                {item.value ?? <span className="text-muted-foreground/50">—</span>}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'contacts' && (
                                <div className="flex flex-col items-center py-12">
                                    <div className="rounded-full bg-muted p-3"><Users className="h-6 w-6 text-muted-foreground" /></div>
                                    <p className="mt-3 text-sm font-medium text-foreground">Sin contactos vinculados</p>
                                    <p className="mt-1 text-xs text-muted-foreground">Los contactos de esta empresa aparecerán aquí</p>
                                </div>
                            )}

                            {activeTab === 'opportunities' && (
                                <div className="flex flex-col items-center py-12">
                                    <div className="rounded-full bg-muted p-3"><Target className="h-6 w-6 text-muted-foreground" /></div>
                                    <p className="mt-3 text-sm font-medium text-foreground">Sin oportunidades</p>
                                    <p className="mt-1 text-xs text-muted-foreground">Las oportunidades de esta empresa aparecerán aquí</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Metrics */}
                <div className="space-y-6">
                    <div className="rounded-xl border border-border bg-card p-6">
                        <h3 className="text-sm font-semibold text-foreground">Métricas Financieras</h3>
                        <div className="mt-4 space-y-4">
                            {[
                                { label: 'ARR', value: formatCurrency(company.arr), icon: BarChart3, color: 'text-blue-500' },
                                { label: 'MRR', value: formatCurrency(company.mrr), icon: TrendingUp, color: 'text-emerald-500' },
                                { label: 'LTV', value: formatCurrency(company.ltv), icon: Target, color: 'text-purple-500' },
                                { label: 'Deals Cerrados', value: formatCurrency(company.total_closed_deals), icon: Target, color: 'text-amber-500' },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <item.icon className={cn('h-4 w-4', item.color)} />
                                        <span className="text-xs text-muted-foreground">{item.label}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-foreground">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6">
                        <h3 className="text-sm font-semibold text-foreground">Churn Risk</h3>
                        <div className="mt-4 flex flex-col items-center">
                            <div className="relative h-28 w-28">
                                <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                                    <circle cx="60" cy="60" r="50" fill="none"
                                        stroke={company.churn_risk_score > 60 ? '#EF4444' : company.churn_risk_score > 30 ? '#F59E0B' : '#10B981'}
                                        strokeWidth="8" strokeLinecap="round"
                                        strokeDasharray={`${(company.churn_risk_score / 100) * 314}`}
                                        className="transition-all duration-700" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-foreground">{company.churn_risk_score}</span>
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                {company.churn_risk_score > 60 ? 'Riesgo Alto' : company.churn_risk_score > 30 ? 'Riesgo Medio' : 'Riesgo Bajo'}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6">
                        <h3 className="text-sm font-semibold text-foreground">Oportunidades Activas</h3>
                        <p className="mt-2 text-3xl font-bold text-foreground">{formatCurrency(company.active_opportunities_value)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">en pipeline activo</p>
                    </div>
                </div>
            </div>

            {showEditModal && <CompanyFormModal company={company} onClose={() => setShowEditModal(false)} />}
        </div>
    )
}
