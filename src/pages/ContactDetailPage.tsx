import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft,
    Mail,
    Phone,
    Edit2,
    Trash2,
    Building2,
    MapPin,
    Calendar,
    Star,
    MoreHorizontal,
    MessageSquare,
    CheckSquare,
    PhoneCall,
    StickyNote,
} from 'lucide-react'
import { useActivities } from '@/hooks/useActivities'
import { useOpportunities } from '@/hooks/useOpportunities'
import { LeadScoreCard } from '@/components/contacts/LeadScoreCard'
import { SmartSuggestions } from '@/components/contacts/SmartSuggestions'
import { cn, formatDate, formatRelativeTime, getInitials, formatCurrency } from '@/lib/utils'
import { useContact, useDeleteContact } from '@/hooks/useContacts'
import { CONTACT_STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/constants'
import { ContactFormModal } from '@/components/contacts/ContactFormModal'

export function ContactDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { data: contact, isLoading } = useContact(id)
    const deleteContact = useDeleteContact()
    const [showEditModal, setShowEditModal] = useState(false)
    const [activeTab, setActiveTab] = useState<'timeline' | 'details' | 'notes'>('timeline')

    // AI Data Fetching
    const { data: activitiesData } = useActivities(
        contact ? { related_to_id: contact.id, related_to_type: 'contact', pageSize: 20 } : {}
    )
    const { data: opportunitiesData } = useOpportunities(
        contact ? { primary_contact_id: contact.id } : {}
    )

    const activities = activitiesData?.data || []
    const opportunities = opportunitiesData?.data || []

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-40 animate-pulse rounded bg-muted" />
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="h-40 animate-pulse rounded-xl bg-muted" />
                        <div className="h-60 animate-pulse rounded-xl bg-muted" />
                    </div>
                    <div className="h-80 animate-pulse rounded-xl bg-muted" />
                </div>
            </div>
        )
    }

    if (!contact) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center">
                <p className="text-lg font-medium text-foreground">Contacto no encontrado</p>
                <button
                    onClick={() => navigate('/contacts')}
                    className="mt-4 text-sm text-primary hover:text-primary/80"
                >
                    Volver a contactos
                </button>
            </div>
        )
    }

    const statusOpt = CONTACT_STATUS_OPTIONS.find((o) => o.value === contact.status)
    const priorityOpt = PRIORITY_OPTIONS.find((o) => o.value === contact.priority)
    const fullName = `${contact.first_name} ${contact.last_name ?? ''}`.trim()

    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
            await deleteContact.mutateAsync(contact.id)
            navigate('/contacts')
        }
    }

    const tabs = [
        { id: 'timeline' as const, label: 'Timeline' },
        { id: 'details' as const, label: 'Detalles' },
        { id: 'notes' as const, label: 'Notas' },
    ]

    return (
        <div className="space-y-6">
            {/* Back */}
            <button
                onClick={() => navigate('/contacts')}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                Contactos
            </button>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* AI Suggestions */}
                    <SmartSuggestions
                        contact={contact}
                        activities={activities as any[]}
                        opportunities={opportunities as any[]}
                    />

                    {/* Contact Header Card */}
                    <div className="rounded-xl border border-border bg-card p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
                                    {getInitials(fullName)}
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-foreground">{fullName}</h1>
                                    {contact.job_title && (
                                        <p className="text-sm text-muted-foreground">{contact.job_title}</p>
                                    )}
                                    <div className="mt-2 flex items-center gap-2">
                                        <span
                                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                                            style={{
                                                backgroundColor: `${statusOpt?.color}15`,
                                                color: statusOpt?.color,
                                            }}
                                        >
                                            <span
                                                className="h-1.5 w-1.5 rounded-full"
                                                style={{ backgroundColor: statusOpt?.color }}
                                            />
                                            {statusOpt?.label}
                                        </span>
                                        <span
                                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                                            style={{
                                                backgroundColor: `${priorityOpt?.color}15`,
                                                color: priorityOpt?.color,
                                            }}
                                        >
                                            Prioridad {priorityOpt?.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="flex h-9 items-center gap-2 rounded-lg border border-input px-3 text-sm font-medium transition-colors hover:bg-accent"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                    Editar
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-input text-destructive transition-colors hover:bg-destructive/10"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Quick Info */}
                        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {contact.email && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4 shrink-0" />
                                    <span className="truncate">{contact.email}</span>
                                </div>
                            )}
                            {contact.phone_mobile && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-4 w-4 shrink-0" />
                                    <span>{contact.phone_mobile}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 shrink-0" />
                                <span>{formatDate(contact.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Star className="h-4 w-4 shrink-0" />
                                <span>Score: {contact.lead_score}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="rounded-xl border border-border bg-card">
                        <div className="flex border-b border-border px-4">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        'relative px-4 py-3 text-sm font-medium transition-colors',
                                        activeTab === tab.id
                                            ? 'text-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="p-6">
                            {activeTab === 'timeline' && (
                                <div className="flex flex-col items-center py-12">
                                    <div className="rounded-full bg-muted p-3">
                                        <MessageSquare className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <p className="mt-3 text-sm font-medium text-foreground">Sin actividad</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Las interacciones con este contacto aparecerán aquí
                                    </p>
                                </div>
                            )}

                            {activeTab === 'details' && (
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Nombre', value: contact.first_name },
                                        { label: 'Apellido', value: contact.last_name },
                                        { label: 'Email', value: contact.email },
                                        { label: 'Email secundario', value: contact.email_secondary },
                                        { label: 'Móvil', value: contact.phone_mobile },
                                        { label: 'Fijo', value: contact.phone_landline },
                                        { label: 'WhatsApp', value: contact.phone_whatsapp },
                                        { label: 'Cargo', value: contact.job_title },
                                        { label: 'Departamento', value: contact.department },
                                        { label: 'Idioma', value: contact.preferred_language },
                                        { label: 'Fuente', value: contact.source },
                                        { label: 'LTV', value: contact.lifetime_value ? formatCurrency(contact.lifetime_value) : null },
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

                            {activeTab === 'notes' && (
                                <div className="flex flex-col items-center py-12">
                                    <div className="rounded-full bg-muted p-3">
                                        <StickyNote className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <p className="mt-3 text-sm font-medium text-foreground">Sin notas</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Agrega notas para este contacto
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Lead Score */}
                    <LeadScoreCard contact={contact} />

                    {/* Quick Stats */}
                    <div className="rounded-xl border border-border bg-card p-6">
                        <h3 className="text-sm font-semibold text-foreground">Métricas</h3>
                        <div className="mt-4 space-y-3">
                            {[
                                { label: 'Revenue Generado', value: formatCurrency(contact.total_revenue_generated) },
                                { label: 'Oportunidades Activas', value: contact.active_opportunities_count.toString() },
                                { label: 'Prob. Conversión', value: `${contact.conversion_probability}%` },
                                { label: 'Engagement Score', value: contact.engagement_score.toString() },
                                { label: 'Días sin interacción', value: contact.days_since_last_interaction.toString() },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">{item.label}</span>
                                    <span className="text-sm font-medium text-foreground">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <ContactFormModal
                    contact={contact}
                    onClose={() => setShowEditModal(false)}
                />
            )}
        </div>
    )
}
