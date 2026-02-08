import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
    GripVertical,
    Trash2,
    Mail,
    Bell,
    UserPlus,
    Clock,
    GitBranch,
    Zap,
    Settings2,
    MessageSquare,
    Tag,
    ArrowRightLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkflowStep } from './types'

// ─── Action metadata ─────────────────────────────────────────
export const ACTION_META: Record<string, { label: string; icon: typeof Zap; color: string; bg: string }> = {
    send_email: { label: 'Enviar Email', icon: Mail, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    send_notification: { label: 'Notificación', icon: Bell, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    create_activity: { label: 'Crear Actividad', icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    update_field: { label: 'Actualizar Campo', icon: Settings2, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    send_whatsapp: { label: 'Enviar WhatsApp', icon: MessageSquare, color: 'text-green-500', bg: 'bg-green-500/10' },
    add_tag: { label: 'Añadir Etiqueta', icon: Tag, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    move_stage: { label: 'Mover Etapa', icon: ArrowRightLeft, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    delay: { label: 'Esperar', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    condition: { label: 'Condición', icon: GitBranch, color: 'text-purple-500', bg: 'bg-purple-500/10' },
}

interface StepNodeProps {
    step: WorkflowStep
    index: number
    isSelected: boolean
    onSelect: () => void
    onDelete: () => void
}

export function StepNode({ step, index, isSelected, onSelect, onDelete }: StepNodeProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: step.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const meta = ACTION_META[step.action_type] ?? {
        label: step.action_type,
        icon: Zap,
        color: 'text-muted-foreground',
        bg: 'bg-muted',
    }
    const Icon = meta.icon

    const configPreview = getConfigPreview(step)

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={onSelect}
            className={cn(
                'group relative flex items-center gap-3 rounded-xl border p-4 transition-all cursor-pointer',
                isDragging && 'opacity-50 shadow-2xl z-50',
                isSelected
                    ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/20'
                    : 'border-border bg-card hover:border-primary/30 hover:shadow-sm',
            )}
        >
            {/* Drag Handle */}
            <button
                {...attributes}
                {...listeners}
                className="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-lg text-muted-foreground/40 transition-colors hover:bg-muted hover:text-muted-foreground active:cursor-grabbing"
            >
                <GripVertical className="h-4 w-4" />
            </button>

            {/* Step Number */}
            <div className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                meta.bg, meta.color
            )}>
                {index + 1}
            </div>

            {/* Icon */}
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', meta.bg)}>
                <Icon className={cn('h-5 w-5', meta.color)} />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{meta.label}</p>
                {configPreview && (
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">{configPreview}</p>
                )}
            </div>

            {/* Delete */}
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground/40 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    )
}

function getConfigPreview(step: WorkflowStep): string | null {
    const c = step.config
    if (!c || Object.keys(c).length === 0) return 'Sin configurar'

    switch (step.action_type) {
        case 'send_email':
            return c.template ? `Plantilla: ${c.template}` : c.subject ? `Asunto: ${c.subject}` : null
        case 'delay':
            return c.duration ? `Esperar ${c.duration} ${c.unit ?? 'horas'}` : null
        case 'condition':
            return c.field ? `Si ${c.field} ${c.operator ?? '='} ${c.value ?? ''}` : null
        case 'update_field':
            return c.field ? `${c.field} → ${c.value ?? ''}` : null
        case 'add_tag':
            return c.tag ? `Etiqueta: ${c.tag}` : null
        case 'send_notification':
            return c.message ? `"${c.message}"` : null
        default:
            return null
    }
}
