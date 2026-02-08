import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    ClipboardList,
    Phone,
    Mail,
    Users,
    StickyNote,
    Calendar as CalendarIcon,
    Clock,
    Flag,
    AlignLeft,
    Building2,
    Target,
    User,
} from 'lucide-react'
import type { Activity, ActivityType, ActivityPriority, ActivityStatus, RelatedToType, ActivityFormData } from '@/lib/api/activities'

interface ActivityFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: ActivityFormData) => void
    activity?: Activity | null
    loading?: boolean
    defaultType?: ActivityType
    defaultRelatedTo?: { type: RelatedToType; id: string }
}

const typeOptions: { value: ActivityType; label: string; icon: typeof ClipboardList; color: string }[] = [
    { value: 'tarea', label: 'Tarea', icon: ClipboardList, color: 'bg-blue-500' },
    { value: 'llamada', label: 'Llamada', icon: Phone, color: 'bg-green-500' },
    { value: 'email', label: 'Email', icon: Mail, color: 'bg-purple-500' },
    { value: 'reunion', label: 'Reunión', icon: Users, color: 'bg-amber-500' },
    { value: 'nota', label: 'Nota', icon: StickyNote, color: 'bg-pink-500' },
]

const priorityOptions: { value: ActivityPriority; label: string; color: string }[] = [
    { value: 'alta', label: 'Alta', color: 'text-red-500' },
    { value: 'media', label: 'Media', color: 'text-amber-500' },
    { value: 'baja', label: 'Baja', color: 'text-green-500' },
]

const statusOptions: { value: ActivityStatus; label: string }[] = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_progreso', label: 'En Progreso' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' },
    { value: 'pospuesta', label: 'Pospuesta' },
]

const relatedTypeOptions: { value: RelatedToType; label: string; icon: typeof User }[] = [
    { value: 'contact', label: 'Contacto', icon: User },
    { value: 'company', label: 'Empresa', icon: Building2 },
    { value: 'opportunity', label: 'Oportunidad', icon: Target },
]

export function ActivityFormModal({
    isOpen,
    onClose,
    onSubmit,
    activity,
    loading = false,
    defaultType = 'tarea',
    defaultRelatedTo,
}: ActivityFormModalProps) {
    const isEditing = !!activity

    const [type, setType] = useState<ActivityType>(defaultType)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState<ActivityPriority>('media')
    const [status, setStatus] = useState<ActivityStatus>('pendiente')
    const [dueDate, setDueDate] = useState('')
    const [durationMinutes, setDurationMinutes] = useState('')
    const [relatedToType, setRelatedToType] = useState<RelatedToType | ''>(defaultRelatedTo?.type ?? '')
    const [relatedToId, setRelatedToId] = useState(defaultRelatedTo?.id ?? '')

    useEffect(() => {
        if (activity) {
            setType(activity.type)
            setTitle(activity.title)
            setDescription(activity.description ?? '')
            setPriority(activity.priority)
            setStatus(activity.status)
            setDueDate(activity.due_date ? activity.due_date.slice(0, 16) : '')
            setDurationMinutes(activity.duration_minutes?.toString() ?? '')
            setRelatedToType(activity.related_to_type ?? '')
            setRelatedToId(activity.related_to_id ?? '')
        } else {
            setType(defaultType)
            setTitle('')
            setDescription('')
            setPriority('media')
            setStatus('pendiente')
            setDueDate('')
            setDurationMinutes('')
            setRelatedToType(defaultRelatedTo?.type ?? '')
            setRelatedToId(defaultRelatedTo?.id ?? '')
        }
    }, [activity, isOpen, defaultType, defaultRelatedTo])

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [isOpen, onClose])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const formData: ActivityFormData = {
            type,
            title,
            description: description || undefined,
            priority,
            status,
            due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
            duration_minutes: durationMinutes ? parseInt(durationMinutes) : undefined,
            related_to_type: relatedToType || undefined,
            related_to_id: relatedToId || undefined,
        }
        onSubmit(formData)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl mx-4"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-foreground">
                                {isEditing ? 'Editar Actividad' : 'Nueva Actividad'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="rounded-lg p-2 text-muted-foreground hover:bg-accent transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Type Selector */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">Tipo</label>
                                <div className="flex gap-2">
                                    {typeOptions.map((opt) => {
                                        const Icon = opt.icon
                                        const selected = type === opt.value
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setType(opt.value)}
                                                className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-xs font-medium transition-all ${selected
                                                        ? 'border-primary bg-primary/10 text-primary'
                                                        : 'border-border bg-background text-muted-foreground hover:border-primary/30'
                                                    }`}
                                            >
                                                <div className={`rounded-lg p-1.5 ${selected ? opt.color : 'bg-muted'}`}>
                                                    <Icon className={`h-4 w-4 ${selected ? 'text-white' : 'text-muted-foreground'}`} />
                                                </div>
                                                {opt.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">
                                    Título *
                                </label>
                                <div className="relative">
                                    <AlignLeft className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder={type === 'llamada' ? 'Llamar a cliente...' : type === 'reunion' ? 'Reunión con...' : 'Título de la actividad'}
                                        className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">
                                    Descripción
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Detalles adicionales..."
                                    rows={3}
                                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                                />
                            </div>

                            {/* Priority + Status Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                        <Flag className="h-3.5 w-3.5" /> Prioridad
                                    </label>
                                    <select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value as ActivityPriority)}
                                        className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    >
                                        {priorityOptions.map((p) => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {isEditing && (
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-foreground">Estado</label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value as ActivityStatus)}
                                            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        >
                                            {statusOptions.map((s) => (
                                                <option key={s.value} value={s.value}>{s.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Due Date + Duration Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                        <CalendarIcon className="h-3.5 w-3.5" /> Fecha límite
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                        <Clock className="h-3.5 w-3.5" /> Duración (min)
                                    </label>
                                    <input
                                        type="number"
                                        value={durationMinutes}
                                        onChange={(e) => setDurationMinutes(e.target.value)}
                                        placeholder="30"
                                        min="0"
                                        className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            {/* Related To */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Relacionado con</label>
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                    {relatedTypeOptions.map((r) => {
                                        const Icon = r.icon
                                        const selected = relatedToType === r.value
                                        return (
                                            <button
                                                key={r.value}
                                                type="button"
                                                onClick={() => setRelatedToType(selected ? '' : r.value)}
                                                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${selected
                                                        ? 'border-primary bg-primary/10 text-primary'
                                                        : 'border-border text-muted-foreground hover:border-primary/30'
                                                    }`}
                                            >
                                                <Icon className="h-3.5 w-3.5" />
                                                {r.label}
                                            </button>
                                        )
                                    })}
                                </div>
                                {relatedToType && (
                                    <input
                                        type="text"
                                        value={relatedToId}
                                        onChange={(e) => setRelatedToId(e.target.value)}
                                        placeholder="ID del registro relacionado"
                                        className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                )}
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 h-11 rounded-xl border border-border bg-background font-medium text-foreground transition-all hover:bg-accent"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !title.trim()}
                                    className="flex-1 h-11 rounded-xl bg-primary font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                    ) : isEditing ? 'Guardar Cambios' : 'Crear Actividad'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
