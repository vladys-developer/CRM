import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    Plus,
    Search,
    ClipboardList,
    Phone,
    Mail,
    Users,
    StickyNote,
    Calendar,
    Clock,
    Flag,
    CheckCircle2,
    CircleDot,
    Pause,
    XCircle,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    ListFilter,
} from 'lucide-react'
import { useActivities, useCreateActivity, useUpdateActivity, useDeleteActivity, useCompleteActivity } from '@/hooks/useActivities'
import { ActivityFormModal } from '@/components/activities/ActivityFormModal'
import type { ActivityType, ActivityStatus, ActivityPriority, ActivityFormData } from '@/lib/api/activities'
import { cn } from '@/lib/utils'

const typeConfig: Record<ActivityType, { label: string; icon: typeof ClipboardList; color: string; bgColor: string }> = {
    tarea: { label: 'Tareas', icon: ClipboardList, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    llamada: { label: 'Llamadas', icon: Phone, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    email: { label: 'Emails', icon: Mail, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    reunion: { label: 'Reuniones', icon: Users, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
    nota: { label: 'Notas', icon: StickyNote, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
}

const statusConfig: Record<ActivityStatus, { label: string; icon: typeof CircleDot; color: string }> = {
    pendiente: { label: 'Pendiente', icon: CircleDot, color: 'text-amber-500' },
    en_progreso: { label: 'En Progreso', icon: Clock, color: 'text-blue-500' },
    completada: { label: 'Completada', icon: CheckCircle2, color: 'text-emerald-500' },
    cancelada: { label: 'Cancelada', icon: XCircle, color: 'text-red-500' },
    pospuesta: { label: 'Pospuesta', icon: Pause, color: 'text-gray-500' },
}

const priorityConfig: Record<ActivityPriority, { label: string; color: string; dotColor: string }> = {
    alta: { label: 'Alta', color: 'text-red-500', dotColor: 'bg-red-500' },
    media: { label: 'Media', color: 'text-amber-500', dotColor: 'bg-amber-500' },
    baja: { label: 'Baja', color: 'text-green-500', dotColor: 'bg-green-500' },
}

const PAGE_SIZE = 15

export function ActivitiesPage() {
    const [search, setSearch] = useState('')
    const [activeTab, setActiveTab] = useState<ActivityType | ''>('')
    const [statusFilter, setStatusFilter] = useState<ActivityStatus | ''>('')
    const [priorityFilter, setPriorityFilter] = useState<ActivityPriority | ''>('')
    const [page, setPage] = useState(1)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedActivity, setSelectedActivity] = useState<any>(null)
    const [actionMenuId, setActionMenuId] = useState<string | null>(null)

    const filters = useMemo(() => ({
        search: search || undefined,
        type: activeTab || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        page,
        pageSize: PAGE_SIZE,
    }), [search, activeTab, statusFilter, priorityFilter, page])

    const { data, isLoading } = useActivities(filters)
    const createMutation = useCreateActivity()
    const updateMutation = useUpdateActivity()
    const deleteMutation = useDeleteActivity()
    const completeMutation = useCompleteActivity()

    const activities = data?.data ?? []
    const totalCount = data?.count ?? 0
    const totalPages = Math.ceil(totalCount / PAGE_SIZE)

    const handleCreate = async (formData: ActivityFormData) => {
        await createMutation.mutateAsync(formData)
        setIsModalOpen(false)
    }

    const handleUpdate = async (formData: ActivityFormData) => {
        if (!selectedActivity) return
        await updateMutation.mutateAsync({ id: selectedActivity.id, data: formData })
        setSelectedActivity(null)
        setIsModalOpen(false)
    }

    const handleDelete = async (id: string) => {
        if (confirm('¿Eliminar esta actividad?')) {
            await deleteMutation.mutateAsync(id)
        }
        setActionMenuId(null)
    }

    const handleComplete = async (id: string) => {
        await completeMutation.mutateAsync(id)
        setActionMenuId(null)
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—'
        const d = new Date(dateStr)
        const now = new Date()
        const diff = d.getTime() - now.getTime()
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

        const formatted = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

        if (days < 0) return <span className="text-red-500" title="Vencida">{formatted}</span>
        if (days === 0) return <span className="text-amber-500" title="Hoy">{formatted}</span>
        if (days === 1) return <span className="text-blue-500" title="Mañana">{formatted}</span>
        return <span>{formatted}</span>
    }

    const tabs = [
        { value: '' as const, label: 'Todas', count: totalCount },
        ...Object.entries(typeConfig).map(([value, config]) => ({
            value: value as ActivityType,
            label: config.label,
            count: null,
        })),
    ]

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Actividades</h1>
                    <p className="text-sm text-muted-foreground">
                        Gestiona tareas, llamadas, emails, reuniones y notas
                    </p>
                </div>
                <button
                    onClick={() => { setSelectedActivity(null); setIsModalOpen(true) }}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
                >
                    <Plus className="h-4 w-4" />
                    Nueva Actividad
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1">
                {tabs.map((tab) => {
                    const config = tab.value ? typeConfig[tab.value] : null
                    const Icon = config?.icon ?? ListFilter
                    const isActive = activeTab === tab.value
                    return (
                        <button
                            key={tab.value || 'all'}
                            onClick={() => { setActiveTab(tab.value); setPage(1) }}
                            className={cn(
                                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all whitespace-nowrap',
                                isActive
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar actividades..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value as ActivityStatus | ''); setPage(1) }}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                    <option value="">Todo Estado</option>
                    {Object.entries(statusConfig).map(([value, config]) => (
                        <option key={value} value={value}>{config.label}</option>
                    ))}
                </select>
                <select
                    value={priorityFilter}
                    onChange={(e) => { setPriorityFilter(e.target.value as ActivityPriority | ''); setPage(1) }}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                    <option value="">Toda Prioridad</option>
                    {Object.entries(priorityConfig).map(([value, config]) => (
                        <option key={value} value={value}>{config.label}</option>
                    ))}
                </select>
            </div>

            {/* Activity List */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                {isLoading ? (
                    <div className="space-y-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 border-b border-border/50 px-5 py-4">
                                <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                                    <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="rounded-full bg-muted p-4">
                            <ClipboardList className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="mt-4 text-sm font-medium text-foreground">Sin actividades</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Crea tu primera actividad para empezar a organizar tu trabajo
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                        >
                            <Plus className="h-4 w-4" />
                            Crear Actividad
                        </button>
                    </div>
                ) : (
                    <div>
                        {activities.map((activity, index) => {
                            const tConfig = typeConfig[activity.type]
                            const sConfig = statusConfig[activity.status]
                            const pConfig = priorityConfig[activity.priority]
                            const TypeIcon = tConfig.icon
                            const StatusIcon = sConfig.icon

                            return (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className={cn(
                                        'group flex items-center gap-4 border-b border-border/50 px-5 py-4 transition-colors hover:bg-accent/50',
                                        activity.status === 'completada' && 'opacity-60'
                                    )}
                                >
                                    {/* Type Icon */}
                                    <div className={cn('rounded-lg p-2.5', tConfig.bgColor)}>
                                        <TypeIcon className={cn('h-4 w-4', tConfig.color)} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={cn(
                                                'text-sm font-medium text-foreground truncate',
                                                activity.status === 'completada' && 'line-through'
                                            )}>
                                                {activity.title}
                                            </p>
                                            {/* Priority dot */}
                                            <div className={cn('h-2 w-2 rounded-full', pConfig.dotColor)} title={pConfig.label} />
                                        </div>
                                        {activity.description && (
                                            <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-md">
                                                {activity.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Status Badge */}
                                    <div className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium', sConfig.color, 'border-current/20')}>
                                        <StatusIcon className="h-3 w-3" />
                                        {sConfig.label}
                                    </div>

                                    {/* Due Date */}
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-36 justify-end">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(activity.due_date)}
                                    </div>

                                    {/* Duration */}
                                    {activity.duration_minutes && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground w-16 justify-end">
                                            <Clock className="h-3 w-3" />
                                            {activity.duration_minutes}m
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setActionMenuId(actionMenuId === activity.id ? null : activity.id)}
                                            className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>

                                        {actionMenuId === activity.id && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setActionMenuId(null)} />
                                                <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-border bg-card p-1 shadow-xl">
                                                    {activity.status !== 'completada' && (
                                                        <button
                                                            onClick={() => handleComplete(activity.id)}
                                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                            Completar
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedActivity(activity)
                                                            setIsModalOpen(true)
                                                            setActionMenuId(null)
                                                        }}
                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent"
                                                    >
                                                        <Flag className="h-4 w-4" />
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(activity.id)}
                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-500/10"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} de {totalCount}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-accent disabled:opacity-50"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-medium text-foreground">
                            {page} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-accent disabled:opacity-50"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Form Modal */}
            <ActivityFormModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedActivity(null) }}
                onSubmit={selectedActivity ? handleUpdate : handleCreate}
                activity={selectedActivity}
                loading={createMutation.isPending || updateMutation.isPending}
                defaultType={activeTab || 'tarea'}
            />
        </div>
    )
}
