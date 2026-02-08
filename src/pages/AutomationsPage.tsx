import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Zap,
    Plus,
    Play,
    Pause,
    Trash2,
    Clock,
    UserPlus,
    ArrowRightLeft,
    Bell,
    Cake,
    Hand,
    Calendar,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Loader2,
    Sparkles,
    Filter,
    Search as SearchIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAutomations, useToggleAutomation, useDeleteAutomation, useCreateAutomation, useAutomationLogs } from '@/hooks/useAutomations'
import type { AutomationInsert } from '@/lib/api/automations'
import type { Tables } from '@/types/database'
import { toast } from 'sonner'

type Automation = Tables<'automations'>

// ─── Trigger metadata ────────────────────────────────────────
const triggerMeta: Record<string, { label: string; icon: typeof Zap; color: string }> = {
    contact_created: { label: 'Contacto creado', icon: UserPlus, color: 'text-emerald-500' },
    deal_stage_changed: { label: 'Etapa cambiada', icon: ArrowRightLeft, color: 'text-blue-500' },
    activity_due: { label: 'Actividad pendiente', icon: Bell, color: 'text-amber-500' },
    contact_birthday: { label: 'Cumpleaños', icon: Cake, color: 'text-pink-500' },
    manual: { label: 'Manual', icon: Hand, color: 'text-purple-500' },
    scheduled: { label: 'Programada', icon: Calendar, color: 'text-cyan-500' },
}

// ─── Templates ───────────────────────────────────────────────
const templates: { name: string; description: string; trigger_type: Automation['trigger_type']; actions: object[] }[] = [
    {
        name: 'Seguimiento de Lead',
        description: 'Envía un email de bienvenida cuando se crea un nuevo contacto',
        trigger_type: 'contact_created',
        actions: [{ type: 'send_email', template: 'welcome' }],
    },
    {
        name: 'Notificación de Etapa',
        description: 'Notifica al equipo cuando una oportunidad cambia de etapa',
        trigger_type: 'deal_stage_changed',
        actions: [{ type: 'notify_team', channel: 'slack' }],
    },
    {
        name: 'Recordatorio de Cumpleaños',
        description: 'Envía una felicitación automática en el cumpleaños del contacto',
        trigger_type: 'contact_birthday',
        actions: [{ type: 'send_email', template: 'birthday' }],
    },
    {
        name: 'Seguimiento de Actividad',
        description: 'Recuerda al responsable cuando una actividad está próxima a vencer',
        trigger_type: 'activity_due',
        actions: [{ type: 'notify_user', before_hours: 24 }],
    },
]

// ─── Component ───────────────────────────────────────────────
export function AutomationsPage() {
    const { data: automations, isLoading, error } = useAutomations()
    const toggleMut = useToggleAutomation()
    const deleteMut = useDeleteAutomation()
    const createMut = useCreateAutomation()
    const navigate = useNavigate()

    const [search, setSearch] = useState('')
    const [filterTrigger, setFilterTrigger] = useState<string>('')
    const [showCreate, setShowCreate] = useState(false)
    const [expandedLogs, setExpandedLogs] = useState<string | null>(null)

    const filtered = (automations ?? []).filter((a) => {
        if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false
        if (filterTrigger && a.trigger_type !== filterTrigger) return false
        return true
    })

    function handleCreateFromTemplate(tpl: typeof templates[0]) {
        const insert: AutomationInsert = {
            name: tpl.name,
            description: tpl.description,
            trigger_type: tpl.trigger_type,
            trigger_config: {},
            conditions: [],
            actions: tpl.actions,
        }
        createMut.mutate(insert, {
            onSuccess: () => {
                toast.success(`Automatización "${tpl.name}" creada`)
                setShowCreate(false)
            },
            onError: () => toast.error('Error al crear la automatización'),
        })
    }

    if (error) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-center space-y-2">
                    <XCircle className="h-10 w-10 text-destructive mx-auto" />
                    <p className="text-sm text-muted-foreground">Error al cargar automatizaciones</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                        <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Automatizaciones</h1>
                        <p className="text-sm text-muted-foreground">
                            {automations?.length ?? 0} automatización{(automations?.length ?? 0) !== 1 ? 'es' : ''}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/automations/new')}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                    >
                        <Zap className="h-4 w-4" />
                        Builder Visual
                    </button>
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="inline-flex items-center gap-2 rounded-lg border border-input px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                    >
                        <Plus className="h-4 w-4" />
                        Plantilla Rápida
                    </button>
                </div>
            </div>

            {/* Create Panel */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-semibold">Plantillas</h2>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {templates.map((tpl) => {
                                    const meta = triggerMeta[tpl.trigger_type]
                                    const Icon = meta?.icon ?? Zap
                                    return (
                                        <button
                                            key={tpl.name}
                                            onClick={() => handleCreateFromTemplate(tpl)}
                                            disabled={createMut.isPending}
                                            className="group flex items-start gap-3 rounded-lg border border-border p-4 text-left transition-all hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50"
                                        >
                                            <div className={cn('mt-0.5 rounded-md p-2', meta?.color)}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium group-hover:text-primary transition-colors">{tpl.name}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tpl.description}</p>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar automatizaciones..."
                        className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <select
                        value={filterTrigger}
                        onChange={(e) => setFilterTrigger(e.target.value)}
                        className="h-10 appearance-none rounded-lg border border-input bg-background pl-10 pr-8 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
                    >
                        <option value="">Todos los triggers</option>
                        {Object.entries(triggerMeta).map(([key, meta]) => (
                            <option key={key} value={key}>{meta.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border">
                    <div className="text-center space-y-1">
                        <Zap className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                        <p className="text-sm text-muted-foreground">
                            {automations?.length ? 'Sin resultados' : 'Aún no tienes automatizaciones'}
                        </p>
                        {!automations?.length && (
                            <button
                                onClick={() => setShowCreate(true)}
                                className="text-xs text-primary hover:underline"
                            >
                                Crear desde plantilla
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((auto) => (
                        <AutomationCard
                            key={auto.id}
                            automation={auto}
                            onToggle={(active) => toggleMut.mutate(
                                { id: auto.id, isActive: active },
                                { onError: () => toast.error('Error al cambiar estado') }
                            )}
                            onDelete={() => {
                                if (confirm('¿Eliminar esta automatización?')) {
                                    deleteMut.mutate(auto.id, {
                                        onSuccess: () => toast.success('Automatización eliminada'),
                                        onError: () => toast.error('Error al eliminar'),
                                    })
                                }
                            }}
                            expandedLogs={expandedLogs}
                            onToggleLogs={(id) => setExpandedLogs(expandedLogs === id ? null : id)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Automation Card ─────────────────────────────────────────
interface CardProps {
    automation: Automation
    onToggle: (active: boolean) => void
    onDelete: () => void
    expandedLogs: string | null
    onToggleLogs: (id: string) => void
}

function AutomationCard({ automation, onToggle, onDelete, expandedLogs, onToggleLogs }: CardProps) {
    const meta = triggerMeta[automation.trigger_type] ?? { label: automation.trigger_type, icon: Zap, color: 'text-muted-foreground' }
    const Icon = meta.icon
    const isExpanded = expandedLogs === automation.id

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
        >
            <div className="flex items-center gap-4 p-4">
                {/* Toggle */}
                <button
                    onClick={() => onToggle(!automation.is_active)}
                    className={cn(
                        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
                        automation.is_active ? 'bg-primary' : 'bg-muted'
                    )}
                >
                    <span
                        className={cn(
                            'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                            automation.is_active ? 'translate-x-5' : 'translate-x-0.5'
                        )}
                    />
                </button>

                {/* Icon */}
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted', meta.color)}>
                    <Icon className="h-4 w-4" />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{automation.name}</p>
                        <span className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
                            automation.is_active
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : 'bg-muted text-muted-foreground'
                        )}>
                            {automation.is_active ? <Play className="h-2.5 w-2.5" /> : <Pause className="h-2.5 w-2.5" />}
                            {automation.is_active ? 'Activa' : 'Pausada'}
                        </span>
                    </div>
                    {automation.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{automation.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                            <Icon className="h-3 w-3" />
                            {meta.label}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {automation.execution_count} ejecucion{automation.execution_count !== 1 ? 'es' : ''}
                        </span>
                        {automation.last_executed_at && (
                            <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(automation.last_executed_at).toLocaleDateString('es-ES')}
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onToggleLogs(automation.id)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Ver logs"
                    >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={onDelete}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        title="Eliminar"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Logs Panel */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <LogsPanel automationId={automation.id} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

// ─── Logs Panel ──────────────────────────────────────────────
function LogsPanel({ automationId }: { automationId: string }) {
    const { data: logs, isLoading } = useAutomationLogs(automationId)

    const statusIcon: Record<string, typeof CheckCircle2> = {
        success: CheckCircle2,
        error: XCircle,
        skipped: AlertTriangle,
    }
    const statusColor: Record<string, string> = {
        success: 'text-emerald-500',
        error: 'text-destructive',
        skipped: 'text-amber-500',
    }

    return (
        <div className="border-t border-border bg-muted/30 px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Historial de ejecuciones</p>
            {isLoading ? (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
            ) : !logs?.length ? (
                <p className="text-xs text-muted-foreground/60 py-2">Sin ejecuciones registradas</p>
            ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {logs.map((log) => {
                        const SIcon = statusIcon[log.status] ?? AlertTriangle
                        return (
                            <div key={log.id} className="flex items-center gap-2 text-xs">
                                <SIcon className={cn('h-3.5 w-3.5 shrink-0', statusColor[log.status])} />
                                <span className="text-muted-foreground">
                                    {new Date(log.executed_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                                </span>
                                <span className={cn('font-medium', statusColor[log.status])}>
                                    {log.status === 'success' ? 'Éxito' : log.status === 'error' ? 'Error' : 'Omitida'}
                                </span>
                                {log.error_message && (
                                    <span className="text-destructive/70 truncate">{log.error_message}</span>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
